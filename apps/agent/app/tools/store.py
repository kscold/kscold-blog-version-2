from __future__ import annotations

from dataclasses import dataclass
import hashlib
import re
import uuid

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


@dataclass(frozen=True)
class SearchHit:
    note: VaultNote
    score: float


QUERY_EXPANSIONS = {
    "자바": ["java"],
    "java": ["자바"],
    "자바스크립트": ["javascript", "js"],
    "javascript": ["자바스크립트", "js"],
    "js": ["javascript", "자바스크립트"],
    "배열": ["array", "arrays"],
    "array": ["배열", "arrays"],
    "arrays": ["array", "배열"],
    "차이": ["비교", "difference"],
    "비교": ["차이", "difference"],
}

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

    def iter_notes(self) -> list[VaultNote]:
        return [self._to_note(document) for document in self.notes.find({})]

    def fetch_notes(self, note_ids: list[str]) -> list[VaultNote]:
        if not note_ids:
            return []
        documents = self.notes.find({"_id": {"$in": note_ids}})
        note_by_id = {str(document["_id"]): self._to_note(document) for document in documents}
        return [note_by_id[note_id] for note_id in note_ids if note_id in note_by_id]

    def resolve_link_notes(self, references: list[str], limit: int) -> list[VaultNote]:
        cleaned = [reference.strip() for reference in references if reference and reference.strip()]
        if not cleaned:
            return []

        normalized = []
        for reference in cleaned:
            normalized.extend(self._link_candidates(reference))

        documents = self.notes.find(
            {
                "$or": [
                    {"_id": {"$in": normalized}},
                    {"slug": {"$in": normalized}},
                    {"title": {"$in": normalized}},
                ]
            }
        ).limit(limit)
        return [self._to_note(document) for document in documents]

    def search(self, query: str, limit: int, active_folder_name: str = "") -> list[SearchHit]:
        folder_ids = self.resolve_folder_scope(active_folder_name)
        if self.qdrant.count(collection_name=self.config.qdrant_collection, exact=True).count == 0:
            return self.keyword_search(query, limit, folder_ids)

        try:
            query_vector = self.embed_text(query)
            hits = self.qdrant.search(
                collection_name=self.config.qdrant_collection,
                query_vector=query_vector,
                limit=limit,
                with_payload=True,
            )
        except Exception:
            return self.keyword_search(query, limit)

        note_ids = [str(hit.payload.get("note_id")) for hit in hits if hit.payload]
        notes = {note.id: note for note in self.fetch_notes(note_ids)}
        if folder_ids:
            notes = {
                note_id: note
                for note_id, note in notes.items()
                if note.folder_id in folder_ids
            }
        return [
            SearchHit(note=notes[note_id], score=float(hit.score))
            for hit, note_id in zip(hits, note_ids)
            if note_id in notes
        ] or self.keyword_search(query, limit, folder_ids)

    def keyword_search(self, query: str, limit: int, folder_ids: set[str | ObjectId] | None = None) -> list[SearchHit]:
        terms = self._query_terms(query)
        language_hints = self._language_hints(terms)
        folder_filter = {"folderId": {"$in": list(folder_ids)}} if folder_ids else {}
        if not terms:
            documents = self.notes.find(folder_filter).limit(limit)
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

        query_filter = {"$and": [folder_filter, {"$or": conditions}]} if folder_filter else {"$or": conditions}
        candidates = list(self.notes.find(query_filter).limit(240))
        scored = [
            SearchHit(
                note=self._to_note(document),
                score=self._keyword_score(document, terms, language_hints, bool(folder_ids)),
            )
            for document in candidates
        ]
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

    def expand_graph(self, hits: list[SearchHit], limit: int) -> list[SearchHit]:
        seen = {hit.note.id for hit in hits}
        expanded = list(hits)
        candidate_refs: list[str] = []
        for hit in hits:
            candidate_refs.extend(link for link in hit.note.outgoing_links if link not in seen)
            candidate_refs.extend(self._extract_wiki_links(hit.note.content))
            backlink_keys = [hit.note.id, hit.note.slug, hit.note.title]
            backlinks = self.notes.find({"outgoingLinks": {"$in": backlink_keys}}).limit(5)
            candidate_refs.extend(str(document["_id"]) for document in backlinks if str(document["_id"]) not in seen)

        for note in self.resolve_link_notes(candidate_refs, limit):
            if note.id in seen:
                continue
            seen.add(note.id)
            expanded.append(SearchHit(note=note, score=0.5))
            if len(expanded) >= limit:
                break
        return expanded

    def reindex(self, force: bool = False) -> tuple[int, int, int]:
        notes = self.iter_notes()
        indexed = 0
        skipped = 0

        for note in notes:
            text = self._embedding_text(note)
            content_hash = hashlib.sha256(text.encode("utf-8")).hexdigest()
            point_id = self._point_id(note.id)
            if not force:
                existing = self.qdrant.retrieve(
                    collection_name=self.config.qdrant_collection,
                    ids=[point_id],
                    with_payload=True,
                    with_vectors=False,
                )
                if existing and existing[0].payload and existing[0].payload.get("content_hash") == content_hash:
                    skipped += 1
                    continue

            self.qdrant.upsert(
                collection_name=self.config.qdrant_collection,
                points=[
                    PointStruct(
                        id=point_id,
                        vector=self.embed_text(text),
                        payload={
                            "note_id": note.id,
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

    def answer(
        self,
        question: str,
        active_folder_name: str,
        context: list[SearchHit],
        web_results: list[str] | None = None,
    ) -> str:
        context_text = "\n---\n".join(
            f"title: {hit.note.title}\nslug: /vault/{hit.note.slug}\ntags: {hit.note.tags}\nscore: {hit.score:.4f}\ncontent:\n{hit.note.content[:2400]}"
            for hit in context
        )
        web_context = "\n---\n".join(web_results or [])
        response = self.openai.chat.completions.create(
            model=self.config.openai_chat_model,
            temperature=0.2,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "너는 KSCOLD Vault를 읽고 답하는 LangGraph RAG Agent다. "
                        "제공된 Vault context를 최우선 근거로 사용하고, 한국어로 답한다. "
                        "질문이 비교형이면 각 대상에 해당하는 Vault 노트를 나누어 근거로 삼고 차이를 표로 정리한다. "
                        "Vault context에 없는 핵심 차이는 일반 LLM 지식으로 보강하되, 반드시 'Vault 밖 일반 지식'이라고 표시한다. "
                        "web context는 최신 정보가 필요한 경우에만 보조 근거로 사용한다. "
                        "확실하지 않은 내용은 추정이라고 말하고, 답변 끝에 참고 Vault 노트를 bullet로 적는다."
                    ),
                },
                {
                    "role": "user",
                    "content": (
                        f"active_folder_name: {active_folder_name or '전체 Vault'}\n"
                        f"question: {question}\n\n"
                        f"vault context:\n{context_text}\n\n"
                        f"web context:\n{web_context}"
                    ),
                },
            ],
        )
        return response.choices[0].message.content or ""

    def log_run(self, question: str, answer: str, sources: list[SearchHit]) -> None:
        self.runs.insert_one(
            {
                "question": question,
                "answer": answer,
                "sources": [
                    {"noteId": hit.note.id, "title": hit.note.title, "slug": hit.note.slug, "score": hit.score}
                    for hit in sources
                ],
            }
        )

    def _embedding_text(self, note: VaultNote) -> str:
        return f"title: {note.title}\nslug: {note.slug}\ntags: {note.tags}\ncontent:\n{note.content}"[:8000]

    def _to_note(self, document: dict) -> VaultNote:
        return VaultNote(
            id=str(document.get("_id")),
            title=document.get("title") or "",
            slug=document.get("slug") or "",
            content=document.get("content") or "",
            folder_id=document.get("folderId"),
            outgoing_links=list(document.get("outgoingLinks") or []),
            tags=list(document.get("tags") or []),
        )

    def _point_id(self, note_id: str) -> str:
        return str(uuid.uuid5(uuid.NAMESPACE_URL, f"kscold-vault-note:{note_id}"))

    def _query_terms(self, query: str) -> list[str]:
        query_lower = query.lower()
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
                terms.extend(QUERY_EXPANSIONS.get(variant, []))

        for keyword, expansions in QUERY_EXPANSIONS.items():
            if keyword in query_lower:
                terms.append(keyword)
                terms.extend(expansions)

        return list(dict.fromkeys(terms))[:24]

    def _strip_korean_particles(self, term: str) -> str:
        for particle in ("에서는", "에게서", "으로부터", "에서", "으로", "로", "과", "와", "은", "는", "이", "가", "을", "를", "의"):
            if term.endswith(particle) and len(term) > len(particle) + 1:
                return term[: -len(particle)]
        return term

    def _language_hints(self, terms: list[str]) -> set[str]:
        hints = {
            folder_hint
            for term in terms
            if (folder_hint := LANGUAGE_FOLDER_HINTS.get(term.lower()))
        }
        lowered_terms = " ".join(term.lower() for term in terms)
        for keyword, folder_hint in LANGUAGE_FOLDER_HINTS.items():
            if keyword in lowered_terms:
                hints.add(folder_hint)
        return hints

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

        selected.sort(key=lambda hit: hit.score, reverse=True)
        return selected[:limit]

    def _note_matches_language(self, note: VaultNote, language_hint: str) -> bool:
        folder_names = self._folder_names(note.folder_id)
        if any(language_hint == name or language_hint in name for name in folder_names):
            return True
        combined = f"{note.title} {note.slug} {' '.join(note.tags)}".lower()
        return language_hint in combined

    def _note_matches_query_focus(self, note: VaultNote, terms: list[str]) -> bool:
        title = note.title.lower()
        slug = note.slug.lower()
        if "배열" in terms or "array" in terms or "arrays" in terms:
            return (
                "array" in title
                or "배열" in title
                or "arrays" in title
                or "arraylist" in title
                or title in {"list", "toarray()"}
                or "array" in slug
                or "배열" in slug
            )
        return True

    def _keyword_score(
        self,
        document: dict,
        terms: list[str],
        language_hints: set[str],
        scoped: bool,
    ) -> float:
        title = str(document.get("title") or "")
        slug = str(document.get("slug") or "")
        content = str(document.get("content") or "")
        tags = " ".join(str(tag) for tag in document.get("tags") or [])
        folder_names = self._folder_names(document.get("folderId"))
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

        if language_hints and folder_names:
            for hint in language_hints:
                if any(hint == folder_name or hint in folder_name for folder_name in folder_names):
                    score += 5 if not scoped else 2

        array_query = "배열" in terms or "array" in terms or "arrays" in terms
        if array_query:
            array_core = (
                "array" in title_lower
                or "배열" in title_lower
                or "arrays" in title_lower
                or "arraylist" in title_lower
                or title_lower in {"list", "toarray()"}
                or "array" in slug_lower
                or "배열" in slug_lower
            )
            array_related = array_core or "배열" in content_lower or "array" in content_lower
            if "array" in title_lower or "배열" in title_lower:
                score += 8
            if "arrays" in title_lower or "arraylist" in title_lower or "list" == title_lower or title_lower == "toarray()":
                score += 4
            if "array" in slug_lower or "배열" in slug_lower:
                score += 3
            if not array_core:
                score *= 0.35 if array_related else 0.2

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
