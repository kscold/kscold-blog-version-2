from __future__ import annotations

from dataclasses import dataclass, field
import hashlib
import re
import uuid
from datetime import datetime, timezone
from typing import Iterator

from bson import ObjectId
from openai import OpenAI
from pymongo import MongoClient
from qdrant_client import QdrantClient
from qdrant_client.http.models import Distance, PointStruct, VectorParams

from app.config import AgentConfig


@dataclass(frozen=True)
class VaultNote:
    id: str
    title: str
    slug: str
    content: str
    folder_id: str | None
    outgoing_links: list[str]
    tags: list[str]
    content_type: str = "vault"
    path: str = ""


@dataclass(frozen=True)
class SearchHit:
    note: VaultNote
    score: float


@dataclass(frozen=True)
class ContentAccessScope:
    """Spring API가 계산한 콘텐츠 열람 범위를 Agent 검색에 적용한다."""

    full_content_access: bool = False
    allowed_post_ids: frozenset[str] = field(default_factory=frozenset)
    allowed_category_ids: frozenset[str] = field(default_factory=frozenset)

    @classmethod
    def full_access(cls) -> "ContentAccessScope":
        return cls(full_content_access=True)

    @classmethod
    def from_values(
        cls,
        full_content_access: bool = False,
        allowed_post_ids: list[str] | None = None,
        allowed_category_ids: list[str] | None = None,
    ) -> "ContentAccessScope":
        return cls(
            full_content_access=full_content_access,
            allowed_post_ids=frozenset(
                value.strip() for value in (allowed_post_ids or []) if value and value.strip()
            ),
            allowed_category_ids=frozenset(
                value.strip()
                for value in (allowed_category_ids or [])
                if value and value.strip()
            ),
        )

    def access_level(self) -> str:
        if self.full_content_access:
            return "full"
        if self.allowed_post_ids or self.allowed_category_ids:
            return "granted"
        return "public"

LANGUAGE_FOLDER_HINTS = {
    "java": "java",
    "자바": "java",
    "javascript": "javascript",
    "자바스크립트": "javascript",
    "js": "javascript",
    "python": "python",
    "파이썬": "python",
    "sql": "sql",
}

FOCUS_STOP_TERMS = {
    "차이",
    "비교",
    "difference",
    "알려줘",
    "설명",
    "설명해줘",
    "정리",
    "정리해줘",
    "관련",
    "노트",
    "에서",
}

PUBLIC_PROFILE_TEXT = """
김승찬은 kscold라는 이름으로 활동하는 개발자입니다.
KSCOLD는 김승찬의 개인 기술 블로그이자, 개발 기록과 실험을 정리하는 공간입니다.
블로그 주소는 kscold.com이며, 공개 블로그 글, 피드, Vault 노트를 통해 학습 기록을 공유합니다.

김승찬은 Java와 Spring Boot 기반 백엔드, React와 Next.js와 TypeScript 기반 프론트엔드,
MongoDB, Docker, AWS 운영, 그리고 LangGraph, RAG, AI Agent 개발에 관심을 두고 실험합니다.
최근에는 Vault 노트를 RAG화하고, Spring API와 Python LangGraph gRPC Agent를 연결하는 구조를 만들고 있습니다.

연락 이메일은 developerkscold@gmail.com입니다.
GitHub는 https://github.com/kscold 입니다.
자세한 공개 소개는 /info 페이지에서 확인할 수 있습니다.
""".strip()

PROFILE_QUERY_TERMS = {
    "김승찬",
    "kscold",
    "KSCOLD",
    "콜딩",
    "블로그 주인",
    "운영자",
    "개발자",
    "너",
    "나",
    "누구",
    "누구야",
    "누구인가",
    "소개",
    "프로필",
    "연락",
    "이메일",
    "github",
    "깃허브",
}


class VaultStore:
    def __init__(self, config: AgentConfig):
        if not config.openai_api_key:
            raise RuntimeError("OPENAI_API_KEY is required")

        self.config = config
        self.openai = OpenAI(api_key=config.openai_api_key)
        self.mongo = MongoClient(config.mongodb_uri)
        self.db = self.mongo[config.mongodb_database]
        self.notes = self.db["vault_notes"]
        self.folders = self.db["vault_folders"]
        self.posts = self.db["posts"]
        self.categories = self.db["categories"]
        self.feeds = self.db["feeds"]
        self.runs = self.db["vault_agent_runs"]
        self.qdrant = QdrantClient(url=config.qdrant_url)
        self._ensure_collection()

    def _ensure_collection(self) -> None:
        collections = {collection.name for collection in self.qdrant.get_collections().collections}
        if self.config.qdrant_collection not in collections:
            vector_size = len(self.embed_text("dimension probe"))
            self.qdrant.create_collection(
                collection_name=self.config.qdrant_collection,
                vectors_config=VectorParams(size=vector_size, distance=Distance.COSINE),
            )

    def embed_text(self, text: str) -> list[float]:
        response = self.openai.embeddings.create(
            model=self.config.openai_embedding_model,
            input=text[:8000],
        )
        return response.data[0].embedding

    def iter_notes(self, content_access_scope: ContentAccessScope | None = None) -> list[VaultNote]:
        scope = content_access_scope or ContentAccessScope()
        return [
            self._to_note(document)
            for document in self.notes.find(self._vault_access_filter(scope))
        ]

    def iter_index_documents(self) -> list[VaultNote]:
        full_scope = ContentAccessScope.full_access()
        return [
            *self.iter_notes(full_scope),
            *self._post_candidates([], full_scope, limit=1000),
            *self._feed_candidates([], full_scope, limit=2000),
            self._profile_candidate(),
        ]

    def fetch_notes(
        self,
        note_ids: list[str],
        content_access_scope: ContentAccessScope | None = None,
    ) -> list[VaultNote]:
        if not note_ids:
            return []
        scope = content_access_scope or ContentAccessScope()
        documents = self.notes.find(
            {
                "$and": [
                    self._vault_access_filter(scope),
                    {"_id": {"$in": self._mongo_ids(note_ids)}},
                ]
            }
        )
        note_by_id = {str(document["_id"]): self._to_note(document) for document in documents}
        return [note_by_id[note_id] for note_id in note_ids if note_id in note_by_id]

    def resolve_link_notes(
        self,
        references: list[str],
        limit: int,
        content_access_scope: ContentAccessScope | None = None,
    ) -> list[VaultNote]:
        cleaned = [reference.strip() for reference in references if reference and reference.strip()]
        if not cleaned:
            return []
        scope = content_access_scope or ContentAccessScope()

        normalized = []
        for reference in cleaned:
            normalized.extend(self._link_candidates(reference))

        documents = self.notes.find(
            {
                "$and": [
                    self._vault_access_filter(scope),
                    {
                        "$or": [
                            {"_id": {"$in": self._mongo_ids(normalized)}},
                            {"slug": {"$in": normalized}},
                            {"title": {"$in": normalized}},
                        ]
                    },
                ]
            }
        ).limit(limit)
        return [self._to_note(document) for document in documents]

    def search(
        self,
        query: str,
        limit: int,
        active_folder_name: str = "",
        content_access_scope: ContentAccessScope | None = None,
    ) -> list[SearchHit]:
        scope = content_access_scope or ContentAccessScope()
        folder_ids = self.resolve_folder_scope(active_folder_name)
        keyword_hits = self.keyword_search(query, limit * 2, folder_ids, scope)
        if self.qdrant.count(collection_name=self.config.qdrant_collection, exact=True).count == 0:
            return keyword_hits[:limit]

        try:
            query_vector = self.embed_text(query)
            hits = self.qdrant.search(
                collection_name=self.config.qdrant_collection,
                query_vector=query_vector,
                # 벡터 후보를 넉넉하게 가져온 뒤 MongoDB의 실제 권한으로 다시 거른다.
                limit=max(limit * 5, 25),
                with_payload=True,
            )
        except Exception:
            return keyword_hits[:limit]

        scored_refs = [
            (
                hit,
                str(hit.payload.get("content_type") or "vault"),
                str(hit.payload.get("document_id") or hit.payload.get("note_id")),
            )
            for hit in hits
            if hit.payload and (hit.payload.get("document_id") or hit.payload.get("note_id"))
        ]
        document_refs = [(document_type, document_id) for _, document_type, document_id in scored_refs]
        notes = self._fetch_index_documents(document_refs, scope)
        if folder_ids:
            notes = {
                key: note
                for key, note in notes.items()
                if note.content_type != "vault"
                or note.folder_id in folder_ids
                or str(note.folder_id) in folder_ids
            }
        vector_hits = [
            SearchHit(note=notes[f"{document_type}:{document_id}"], score=float(hit.score) + 1)
            for hit, document_type, document_id in scored_refs
            if f"{document_type}:{document_id}" in notes
        ]
        return self._merge_search_hits(
            vector_hits,
            keyword_hits,
            limit,
            self._language_hints(self._query_terms(query)),
        )

    def keyword_search(
        self,
        query: str,
        limit: int,
        folder_ids: set[str | ObjectId] | None = None,
        content_access_scope: ContentAccessScope | None = None,
    ) -> list[SearchHit]:
        scope = content_access_scope or ContentAccessScope()
        terms = self._query_terms(query)
        language_hints = self._language_hints(terms)
        folder_filter = {"folderId": {"$in": list(folder_ids)}} if folder_ids else {}
        vault_filter = self._vault_access_filter(scope)
        if not terms:
            query_filter = {
                "$and": [vault_filter, folder_filter]
            } if folder_filter else vault_filter
            documents = self.notes.find(query_filter).limit(limit)
            return [SearchHit(note=self._to_note(document), score=0.35) for document in documents]

        conditions = []
        for term in terms:
            pattern = re.escape(term)
            conditions.extend(
                [
                    {"title": {"$regex": pattern, "$options": "i"}},
                    {"content": {"$regex": pattern, "$options": "i"}},
                    {"tags": {"$regex": pattern, "$options": "i"}},
                ]
            )

        query_filter = {
            "$and": [vault_filter, folder_filter, {"$or": conditions}]
        } if folder_filter else {"$and": [vault_filter, {"$or": conditions}]}
        candidates = [self._to_note(document) for document in self.notes.find(query_filter).limit(800)]
        if not folder_ids:
            candidates.extend(self._post_candidates(conditions, scope))
            candidates.extend(self._feed_candidates(conditions, scope))
            profile = self._profile_candidate()
            if self._profile_query_matches(query, terms) or self._note_matches_query_focus(profile, terms):
                candidates.append(profile)
        scored = [
            SearchHit(
                note=candidate,
                score=self._keyword_score(candidate, terms, language_hints, bool(folder_ids)),
            )
            for candidate in candidates
        ]
        if not folder_ids and self._profile_query_matches(query, terms):
            scored.append(SearchHit(note=self._profile_candidate(), score=12.0))
        scored.sort(key=lambda hit: hit.score, reverse=True)
        return self._balanced_hits(scored, language_hints, terms, limit)

    def resolve_folder_scope(self, active_folder_name: str) -> set[str | ObjectId]:
        if not active_folder_name:
            return set()

        folder = self.folders.find_one(
            {
                "$or": [
                    {"name": active_folder_name},
                    {"slug": active_folder_name},
                    {"slug": active_folder_name.lower()},
                ]
            }
        )
        if not folder:
            return set()

        folder_object_id = folder["_id"]
        folder_id = str(folder_object_id)
        descendants = self.folders.find(
            {"$or": [{"ancestors": folder_object_id}, {"ancestors": folder_id}, {"parent": folder_object_id}, {"parent": folder_id}]},
            {"_id": 1},
        )
        descendant_ids = [document["_id"] for document in descendants]
        return {
            folder_object_id,
            folder_id,
            *(descendant_id for descendant_id in descendant_ids),
            *(str(descendant_id) for descendant_id in descendant_ids),
        }

    def expand_graph(
        self,
        hits: list[SearchHit],
        limit: int,
        content_access_scope: ContentAccessScope | None = None,
    ) -> list[SearchHit]:
        scope = content_access_scope or ContentAccessScope()
        seen = {hit.note.id for hit in hits}
        expanded = list(hits)
        candidate_refs: list[str] = []
        for hit in hits:
            candidate_refs.extend(link for link in hit.note.outgoing_links if link not in seen)
            candidate_refs.extend(self._extract_wiki_links(hit.note.content))
            backlink_keys = [hit.note.id, hit.note.slug, hit.note.title]
            backlinks = self.notes.find(
                {
                    "$and": [
                        self._vault_access_filter(scope),
                        {"outgoingLinks": {"$in": backlink_keys}},
                    ]
                }
            ).limit(5)
            candidate_refs.extend(str(document["_id"]) for document in backlinks if str(document["_id"]) not in seen)

        for note in self.resolve_link_notes(candidate_refs, limit, scope):
            if note.id in seen:
                continue
            seen.add(note.id)
            expanded.append(SearchHit(note=note, score=0.5))
            if len(expanded) >= limit:
                break
        return expanded

    def reindex(self, force: bool = False) -> tuple[int, int, int]:
        notes = self.iter_index_documents()
        indexed = 0
        skipped = 0

        for note in notes:
            text = self._embedding_text(note)
            content_hash = hashlib.sha256(text.encode("utf-8")).hexdigest()
            point_id = self._point_id(note)
            if not force:
                existing = self.qdrant.retrieve(
                    collection_name=self.config.qdrant_collection,
                    ids=[point_id],
                    with_payload=True,
                    with_vectors=False,
                )
                payload = existing[0].payload if existing else None
                if (
                    payload
                    and payload.get("content_hash") == content_hash
                    and payload.get("content_type") == note.content_type
                    and payload.get("document_id") == note.id
                    and payload.get("path") == note.path
                ):
                    skipped += 1
                    continue

            self.qdrant.upsert(
                collection_name=self.config.qdrant_collection,
                points=[
                    PointStruct(
                        id=point_id,
                        vector=self.embed_text(text),
                        payload={
                            "content_type": note.content_type,
                            "document_id": note.id,
                            "note_id": note.id,
                            "path": note.path,
                            "slug": note.slug,
                            "title": note.title,
                            "tags": note.tags,
                            "content_hash": content_hash,
                        },
                    )
                ],
            )
            indexed += 1

        return len(notes), indexed, skipped

    def _dedupe_hits(self, hits: list[SearchHit], limit: int) -> list[SearchHit]:
        selected: list[SearchHit] = []
        seen: set[str] = set()
        for hit in sorted(hits, key=lambda item: item.score, reverse=True):
            key = f"{hit.note.content_type}:{hit.note.id}"
            if key in seen:
                continue
            seen.add(key)
            selected.append(hit)
            if len(selected) >= limit:
                break
        return selected

    def _merge_search_hits(
        self,
        vector_hits: list[SearchHit],
        keyword_hits: list[SearchHit],
        limit: int,
        language_hints: set[str],
    ) -> list[SearchHit]:
        merged = self._dedupe_hits([*vector_hits, *keyword_hits], max(limit * 3, limit))
        if len(language_hints) < 2:
            return merged[:limit]

        selected: list[SearchHit] = []
        selected_keys: set[str] = set()
        candidates = sorted(
            [*keyword_hits, *vector_hits],
            key=lambda hit: hit.score,
            reverse=True,
        )
        for language_hint in sorted(language_hints):
            exclusive_candidates = [
                hit
                for hit in candidates
                if self._note_matches_language(hit.note, language_hint)
                and not any(
                    other_hint != language_hint
                    and self._note_matches_language(hit.note, other_hint)
                    for other_hint in language_hints
                )
            ]
            language_candidates = exclusive_candidates or [
                hit for hit in candidates if self._note_matches_language(hit.note, language_hint)
            ]
            for hit in language_candidates:
                key = f"{hit.note.content_type}:{hit.note.id}"
                if key in selected_keys:
                    continue
                selected.append(hit)
                selected_keys.add(key)
                break

        for hit in merged:
            key = f"{hit.note.content_type}:{hit.note.id}"
            if key in selected_keys:
                continue
            selected.append(hit)
            selected_keys.add(key)
            if len(selected) >= limit:
                break

        return selected[:limit]

    def _post_candidates(
        self,
        conditions: list[dict],
        content_access_scope: ContentAccessScope,
        limit: int = 120,
    ) -> list[VaultNote]:
        post_conditions = []
        for condition in conditions:
            if "title" in condition:
                post_conditions.append({"title": condition["title"]})
            if "content" in condition:
                post_conditions.append({"content": condition["content"]})
                post_conditions.append({"excerpt": condition["content"]})
            if "tags" in condition:
                post_conditions.append({"tags.name": condition["tags"]})
        access_filter = self._post_access_filter(content_access_scope)
        query_filter = (
            {"$and": [access_filter, {"$or": post_conditions}]}
            if post_conditions
            else access_filter
        )
        return [self._to_post(document) for document in self.posts.find(query_filter).limit(limit)]

    def _feed_candidates(
        self,
        conditions: list[dict],
        content_access_scope: ContentAccessScope,
        limit: int = 120,
    ) -> list[VaultNote]:
        feed_conditions = []
        for condition in conditions:
            if "title" in condition:
                feed_conditions.append({"linkPreview.title": condition["title"]})
            if "content" in condition:
                feed_conditions.append({"content": condition["content"]})
            if "tags" in condition:
                feed_conditions.append({"tags": condition["tags"]})
        access_filter = self._feed_access_filter(content_access_scope)
        query_filter = (
            {"$and": [access_filter, {"$or": feed_conditions}]}
            if feed_conditions
            else access_filter
        )
        return [self._to_feed(document) for document in self.feeds.find(query_filter).limit(limit)]

    def _fetch_index_documents(
        self,
        refs: list[tuple[str, str]],
        content_access_scope: ContentAccessScope,
    ) -> dict[str, VaultNote]:
        refs_by_type: dict[str, list[str]] = {}
        for content_type, document_id in refs:
            refs_by_type.setdefault(content_type, []).append(document_id)

        documents: dict[str, VaultNote] = {}
        vault_ids = refs_by_type.get("vault", [])
        for note in self.fetch_notes(vault_ids, content_access_scope):
            documents[f"vault:{note.id}"] = note

        post_ids = refs_by_type.get("blog", [])
        if post_ids:
            access_filter = self._post_access_filter(content_access_scope)
            query_filter = {"$and": [access_filter, {"_id": {"$in": self._mongo_ids(post_ids)}}]}
            for document in self.posts.find(query_filter):
                note = self._to_post(document)
                documents[f"blog:{note.id}"] = note

        feed_ids = refs_by_type.get("feed", [])
        if feed_ids:
            access_filter = self._feed_access_filter(content_access_scope)
            query_filter = {"$and": [access_filter, {"_id": {"$in": self._mongo_ids(feed_ids)}}]}
            for document in self.feeds.find(query_filter):
                note = self._to_feed(document)
                documents[f"feed:{note.id}"] = note

        if refs_by_type.get("profile"):
            profile = self._profile_candidate()
            documents[f"profile:{profile.id}"] = profile

        return documents

    def _post_access_filter(self, content_access_scope: ContentAccessScope) -> dict:
        if content_access_scope.full_content_access:
            return {}

        access_conditions = self._public_post_visibility_conditions()
        if content_access_scope.allowed_post_ids:
            access_conditions.append(
                {"_id": {"$in": self._mongo_ids(list(content_access_scope.allowed_post_ids))}}
            )
        if content_access_scope.allowed_category_ids:
            access_conditions.append(
                {"category.id": {"$in": list(content_access_scope.allowed_category_ids)}}
            )
        return {"status": "PUBLISHED", "$or": access_conditions}

    def _public_post_filter(self) -> dict:
        return {"status": "PUBLISHED", "$or": self._public_post_visibility_conditions()}

    def _public_post_visibility_conditions(self) -> list[dict]:
        restricted_category_ids = [
            str(document.get("_id"))
            for document in self.categories.find({"restricted": True}, {"_id": 1})
        ]
        return [
            {"publicOverride": True},
            {"category.id": {"$nin": restricted_category_ids}},
            {"category.id": {"$exists": False}},
        ]

    def _vault_access_filter(self, content_access_scope: ContentAccessScope) -> dict:
        if content_access_scope.full_content_access:
            return {}
        return self._public_vault_filter()

    def _feed_access_filter(self, content_access_scope: ContentAccessScope) -> dict:
        if content_access_scope.full_content_access:
            return {}
        return {"visibility": "PUBLIC"}

    def _public_vault_filter(self) -> dict:
        return {
            "$or": [
                {"visibility": {"$exists": False}},
                {"visibility": None},
                {"visibility": "PUBLIC"},
                {"public": True},
                {"publicOverride": True},
            ]
        }

    def _mongo_ids(self, ids: list[str]) -> list[object]:
        values: list[object] = []
        for value in ids:
            values.append(value)
            if ObjectId.is_valid(value):
                values.append(ObjectId(value))
        return values

    def _profile_candidate(self) -> VaultNote:
        return VaultNote(
            id="profile:kscold",
            title="김승찬(kscold) 공개 프로필",
            slug="info",
            content=PUBLIC_PROFILE_TEXT,
            folder_id=None,
            outgoing_links=[],
            tags=["김승찬", "kscold", "KSCOLD", "콜딩", "블로그 주인", "운영자", "프로필", "개발자", "AI Agent", "Spring Boot", "Next.js"],
            content_type="profile",
            path="/info",
        )

    def _profile_query_matches(self, query: str, terms: list[str]) -> bool:
        normalized_query = query.lower()
        normalized_terms = {term.lower() for term in terms}
        return any(term.lower() in normalized_query or term.lower() in normalized_terms for term in PROFILE_QUERY_TERMS)

    def answer(
        self,
        question: str,
        active_folder_name: str,
        context: list[SearchHit],
        web_results: list[str] | None = None,
        content_access_scope: ContentAccessScope | None = None,
    ) -> str:
        response = self.openai.chat.completions.create(
            model=self.config.openai_chat_model,
            temperature=0.2,
            messages=self._answer_messages(
                question,
                active_folder_name,
                context,
                web_results,
                content_access_scope or ContentAccessScope(),
            ),
        )
        return response.choices[0].message.content or ""

    def answer_stream(
        self,
        question: str,
        active_folder_name: str,
        context: list[SearchHit],
        web_results: list[str] | None = None,
        content_access_scope: ContentAccessScope | None = None,
    ) -> Iterator[str]:
        response = self.openai.chat.completions.create(
            model=self.config.openai_chat_model,
            temperature=0.2,
            stream=True,
            messages=self._answer_messages(
                question,
                active_folder_name,
                context,
                web_results,
                content_access_scope or ContentAccessScope(),
            ),
        )
        for chunk in response:
            if not chunk.choices:
                continue
            delta = chunk.choices[0].delta.content
            if delta:
                yield delta

    def _answer_messages(
        self,
        question: str,
        active_folder_name: str,
        context: list[SearchHit],
        web_results: list[str] | None,
        content_access_scope: ContentAccessScope,
    ) -> list[dict[str, str]]:
        context_text = "\n---\n".join(
            f"type: {hit.note.content_type}\ntitle: {hit.note.title}\npath: {hit.note.path or f'/vault/{hit.note.slug}'}\ntags: {hit.note.tags}\nscore: {hit.score:.4f}\ncontent:\n{hit.note.content[:2400]}"
            for hit in context
        )
        web_context = "\n---\n".join(web_results or [])
        access_description = {
            "full": "관리자 전체 열람 범위",
            "granted": "공개 기록과 승인된 열람 범위",
            "public": "공개 기록 범위",
        }[content_access_scope.access_level()]
        return [
            {
                "role": "system",
                "content": (
                    "너는 KSCOLD의 블로그 글, 피드, Vault 기록과 소개 페이지를 찾아 답하는 Agent다. "
                    "제공된 검색 결과는 현재 사용자에게 허용된 기록만 담고 있으므로, 오직 그 결과만 내부 기록의 근거로 사용한다. "
                    "검색 결과에 없는 비공개 내용이나 권한 밖의 내용을 추측하거나 암시하지 않는다. "
                    "블로그 주인 김승찬은 항상 '승찬님'이라고 자연스럽게 부른다. 방문자를 승찬님으로 단정하지는 않는다. "
                    "승찬님을 설명할 때는 친근하고 존중하는 어조를 쓰되 과장된 아부나 역할극은 피한다. "
                    "김승찬, kscold, KSCOLD, 블로그 주인 관련 질문은 제공된 프로필 기록을 우선 참고한다. "
                    "비교 질문은 각 대상을 구분해 설명하고, 근거가 충분하면 읽기 쉬운 표를 사용한다. "
                    "검색 결과에 없는 핵심 설명은 모델의 일반 지식으로 보강할 수 있지만, 해당 문단 첫머리에 '일반 지식 보강:'을 명시한다. "
                    "웹 검색 결과는 최신성 확인이 필요할 때만 보조 근거로 사용한다. "
                    "한국어로 자연스럽고 간결하게 답하며, 마지막에는 실제로 참고한 기록을 짧은 목록으로 정리한다."
                ),
            },
            {
                "role": "user",
                "content": (
                    f"현재 열람 범위: {access_description}\n"
                    f"선택된 폴더: {active_folder_name or '전체 기록'}\n"
                    f"질문: {question}\n\n"
                    f"검색된 기록:\n{context_text or '관련 기록을 찾지 못했습니다.'}\n\n"
                    f"웹 검색 보강:\n{web_context or '없음'}"
                ),
            },
        ]

    def follow_ups(
        self,
        question: str,
        answer: str,
        context: list[SearchHit],
    ) -> list[str]:
        try:
            context_text = "\n---\n".join(
                f"type: {hit.note.content_type}\ntitle: {hit.note.title}\ntags: {hit.note.tags}"
                for hit in context
            )
            response = self.openai.chat.completions.create(
                model=self.config.openai_chat_model,
                temperature=0.5,
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "너는 KSCOLD 블로그, 피드, Vault 기록과 소개 페이지 대화의 흐름을 이어가는 도우미다. "
                            "블로그 주인 김승찬은 '승찬님'이라고 자연스럽게 지칭한다. "
                            "방금 나온 답변에서 더 깊이 파고들거나 인접 주제로 확장하는, "
                            "사용자가 실제로 궁금해할 법한 한국어 후속질문 3개를 생성한다. "
                            "각 질문은 25자 내외로 짧고 구체적으로 만든다. "
                            "이미 답한 내용을 그대로 반복하는 질문은 금지한다. "
                            "출력은 한 줄에 하나씩, 번호나 불릿 기호 없이 질문 문장만 3줄로 적는다."
                        ),
                    },
                    {
                        "role": "user",
                        "content": (
                            f"직전 질문: {question}\n\n"
                            f"방금 생성한 답변:\n{answer}\n\n"
                            f"참고한 기록:\n{context_text}"
                        ),
                    },
                ],
            )
            raw = response.choices[0].message.content or ""
            questions: list[str] = []
            for line in raw.splitlines():
                cleaned = line.strip().lstrip("-•*0123456789.)· ").strip()
                if cleaned:
                    questions.append(cleaned)
            return questions[:3]
        except Exception:
            return []

    def log_run(
        self,
        question: str,
        answer: str,
        sources: list[SearchHit],
        content_access_scope: ContentAccessScope | None = None,
    ) -> None:
        scope = content_access_scope or ContentAccessScope()
        self.runs.insert_one(
            {
                "question": question,
                "answer": answer,
                "sourceCount": len(sources),
                "accessLevel": scope.access_level(),
                "createdAt": datetime.now(timezone.utc),
                "sources": [
                    {
                        "noteId": hit.note.id,
                        "title": hit.note.title,
                        "slug": hit.note.slug,
                        "score": hit.score,
                        "type": hit.note.content_type,
                        "path": hit.note.path or f"/vault/{hit.note.slug}",
                    }
                    for hit in sources
                ],
            }
        )

    def _embedding_text(self, note: VaultNote) -> str:
        folder_names = self._folder_names(note.folder_id)
        return (
            f"type: {note.content_type}\n"
            f"folder: {' > '.join(folder_names)}\n"
            f"title: {note.title}\n"
            f"slug: {note.slug}\n"
            f"tags: {note.tags}\n"
            f"content:\n{note.content}"
        )[:8000]

    def _to_note(self, document: dict) -> VaultNote:
        return VaultNote(
            id=str(document.get("_id")),
            title=document.get("title") or "",
            slug=document.get("slug") or "",
            content=document.get("content") or "",
            folder_id=document.get("folderId"),
            outgoing_links=list(document.get("outgoingLinks") or []),
            tags=list(document.get("tags") or []),
            content_type="vault",
            path=f"/vault/{document.get('slug') or ''}",
        )

    def _to_post(self, document: dict) -> VaultNote:
        category = document.get("category") or {}
        tags = [tag.get("name", "") for tag in document.get("tags") or [] if isinstance(tag, dict)]
        slug = document.get("slug") or ""
        category_slug = category.get("slug") or "blog"
        return VaultNote(
            id=str(document.get("_id")),
            title=document.get("title") or "블로그 글",
            slug=slug,
            content="\n".join(part for part in [document.get("excerpt") or "", document.get("content") or ""] if part),
            folder_id=None,
            outgoing_links=[],
            tags=tags,
            content_type="blog",
            path=f"/blog/{category_slug}/{slug}",
        )

    def _to_feed(self, document: dict) -> VaultNote:
        preview = document.get("linkPreview") or {}
        title = preview.get("title") or (document.get("content") or "피드")[:48]
        feed_id = str(document.get("_id"))
        return VaultNote(
            id=feed_id,
            title=title,
            slug=feed_id,
            content="\n".join(part for part in [document.get("content") or "", preview.get("description") or ""] if part),
            folder_id=None,
            outgoing_links=[],
            tags=list(document.get("tags") or []),
            content_type="feed",
            path=f"/feed/{feed_id}",
        )

    def _point_id(self, note: VaultNote) -> str:
        document_key = note.id if note.content_type == "vault" else f"{note.content_type}:{note.id}"
        return str(uuid.uuid5(uuid.NAMESPACE_URL, f"kscold-vault-note:{document_key}"))

    def _query_terms(self, query: str) -> list[str]:
        raw_terms = [
            term.strip()
            for term in re.split(r"[\s,./|:;()\[\]{}<>!?\"'`~]+", query)
            if len(term.strip()) >= 2
        ]
        terms: list[str] = []
        for term in raw_terms:
            lower = term.lower()
            variants = [term, lower, self._strip_korean_particles(lower)]
            for variant in variants:
                if len(variant) < 2:
                    continue
                terms.append(variant)

        return list(dict.fromkeys(terms))[:24]

    def _strip_korean_particles(self, term: str) -> str:
        for particle in ("에서는", "에게서", "으로부터", "에서", "으로", "로", "과", "와", "은", "는", "이", "가", "을", "를", "의"):
            if term.endswith(particle) and len(term) > len(particle) + 1:
                return term[: -len(particle)]
        return term

    def _language_hints(self, terms: list[str]) -> set[str]:
        return {
            folder_hint
            for term in terms
            if (folder_hint := LANGUAGE_FOLDER_HINTS.get(term.lower()))
        }

    def _folder_name(self, folder_id: object) -> str:
        names = self._folder_names(folder_id)
        return names[-1] if names else ""

    def _folder_names(self, folder_id: object) -> list[str]:
        if not folder_id:
            return []

        folder = self.folders.find_one({"_id": folder_id}, {"name": 1, "parent": 1, "ancestors": 1})
        if not folder and ObjectId.is_valid(str(folder_id)):
            folder = self.folders.find_one({"_id": ObjectId(str(folder_id))}, {"name": 1, "parent": 1, "ancestors": 1})
        if not folder:
            return []

        ancestor_ids = list(folder.get("ancestors") or [])
        names: list[str] = []
        if ancestor_ids:
            ancestor_lookup_ids: list[object] = []
            for ancestor_id in ancestor_ids:
                ancestor_lookup_ids.append(ancestor_id)
                if ObjectId.is_valid(str(ancestor_id)):
                    ancestor_lookup_ids.append(ObjectId(str(ancestor_id)))
            ancestors = self.folders.find({"_id": {"$in": ancestor_lookup_ids}}, {"_id": 1, "name": 1})
            ancestor_name_by_id = {str(document["_id"]): str(document.get("name") or "").lower() for document in ancestors}
            names.extend(ancestor_name_by_id.get(str(ancestor_id), "") for ancestor_id in ancestor_ids)
        names.append(str(folder.get("name") or "").lower())
        return [name for name in names if name]

    def _balanced_hits(self, hits: list[SearchHit], language_hints: set[str], terms: list[str], limit: int) -> list[SearchHit]:
        if len(language_hints) <= 1 or limit <= 2:
            return hits[:limit]

        selected: list[SearchHit] = []
        selected_ids: set[str] = set()
        per_language_target = max(1, min(2, limit // len(language_hints)))
        for hint in sorted(language_hints):
            language_hits = [hit for hit in hits if self._note_matches_language(hit.note, hint)]
            focused_language_hits = [hit for hit in language_hits if self._note_matches_query_focus(hit.note, terms)]
            if focused_language_hits:
                language_hits = focused_language_hits
            for hit in language_hits[:per_language_target]:
                if hit.note.id in selected_ids:
                    continue
                selected.append(hit)
                selected_ids.add(hit.note.id)

        for hit in hits:
            if len(selected) >= limit:
                break
            if hit.note.id in selected_ids:
                continue
            selected.append(hit)
            selected_ids.add(hit.note.id)

        return selected[:limit]

    def _note_matches_language(self, note: VaultNote, language_hint: str) -> bool:
        folder_names = self._folder_names(note.folder_id)
        if any(language_hint == name for name in folder_names):
            return True
        combined = f"{note.title} {note.slug} {' '.join(note.tags)}".lower()
        if re.fullmatch(r"[a-z0-9.+#-]+", language_hint):
            return re.search(rf"(?<![a-z0-9]){re.escape(language_hint)}(?![a-z0-9])", combined) is not None
        return language_hint in combined

    def _note_matches_query_focus(self, note: VaultNote, terms: list[str]) -> bool:
        focus_terms = self._content_focus_terms(terms)
        if not focus_terms:
            return True
        combined = f"{note.title} {note.slug} {' '.join(note.tags)} {note.content[:1200]}".lower()
        return any(term in combined for term in focus_terms)

    def _content_focus_terms(self, terms: list[str]) -> list[str]:
        language_aliases = set(LANGUAGE_FOLDER_HINTS.keys()) | set(LANGUAGE_FOLDER_HINTS.values())
        return [
            term.lower()
            for term in terms
            if len(term) >= 2
            and term.lower() not in language_aliases
            and term.lower() not in FOCUS_STOP_TERMS
        ][:8]

    def _keyword_score(
        self,
        note: VaultNote,
        terms: list[str],
        language_hints: set[str],
        scoped: bool,
    ) -> float:
        title = note.title
        slug = note.slug
        content = note.content
        tags = " ".join(note.tags)
        folder_names = self._folder_names(note.folder_id)
        title_lower = title.lower()
        slug_lower = slug.lower()
        content_lower = content.lower()
        tags_lower = tags.lower()

        score = 0.25
        for term in terms:
            lower = term.lower()
            if not lower:
                continue
            if lower == title_lower:
                score += 8
            elif lower in title_lower:
                score += 4
            if lower in slug_lower:
                score += 2.5
            if lower in tags_lower:
                score += 2
            score += min(content_lower.count(lower), 6) * 0.35

        focus_terms = self._content_focus_terms(terms)
        if focus_terms and all(term in title_lower or term in slug_lower for term in focus_terms):
            score += 10

        if language_hints and folder_names:
            for hint in language_hints:
                if any(hint == folder_name or hint in folder_name for folder_name in folder_names):
                    score += 5 if not scoped else 2

        comparison_query = "차이" in terms or "비교" in terms or "difference" in terms
        if comparison_query and len(language_hints) >= 2:
            score += 1.5

        return round(score, 4)

    def _extract_wiki_links(self, content: str) -> list[str]:
        if not content:
            return []
        links = re.findall(r"\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|[^\]]+)?\]\]", content)
        links.extend(re.findall(r"\]\(/vault/([^)#]+)(?:#[^)]+)?\)", content))
        return links

    def _link_candidates(self, reference: str) -> list[str]:
        value = reference.strip()
        value = value.removeprefix("/vault/")
        value = value.removesuffix(".md")
        without_anchor = value.split("#", 1)[0].strip()
        without_alias = without_anchor.split("|", 1)[0].strip()
        return list(
            dict.fromkeys(
                candidate
                for candidate in [
                    reference.strip(),
                    value,
                    without_anchor,
                    without_alias,
                    without_alias.replace(" ", "-"),
                ]
                if candidate
            )
        )
