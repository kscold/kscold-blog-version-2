from __future__ import annotations

from dataclasses import dataclass
import hashlib
import re
import uuid

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


class VaultStore:
    def __init__(self, config: AgentConfig):
        if not config.openai_api_key:
            raise RuntimeError("OPENAI_API_KEY is required")

        self.config = config
        self.openai = OpenAI(api_key=config.openai_api_key)
        self.mongo = MongoClient(config.mongodb_uri)
        self.db = self.mongo[config.mongodb_database]
        self.notes = self.db["vault_notes"]
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

    def search(self, query: str, limit: int) -> list[SearchHit]:
        if self.qdrant.count(collection_name=self.config.qdrant_collection, exact=True).count == 0:
            self.reindex()

        query_vector = self.embed_text(query)
        hits = self.qdrant.search(
            collection_name=self.config.qdrant_collection,
            query_vector=query_vector,
            limit=limit,
            with_payload=True,
        )
        note_ids = [str(hit.payload.get("note_id")) for hit in hits if hit.payload]
        notes = {note.id: note for note in self.fetch_notes(note_ids)}
        return [
            SearchHit(note=notes[note_id], score=float(hit.score))
            for hit, note_id in zip(hits, note_ids)
            if note_id in notes
        ]

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
