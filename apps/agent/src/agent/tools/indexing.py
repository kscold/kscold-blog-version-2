from __future__ import annotations

import hashlib
import uuid

from qdrant_client.http.models import PointStruct

from agent.tools.models import VaultNote


class VaultIndexingMixin:
    """원본 MongoDB를 변경하지 않고 Qdrant 전용 컬렉션만 증분 색인합니다."""

    def reindex(self, force: bool = False) -> tuple[int, int, int]:
        notes = self.iter_index_documents()
        indexed = 0
        skipped = 0
        for note in notes:
            text = self._embedding_text(note)
            content_hash = hashlib.sha256(text.encode("utf-8")).hexdigest()
            point_id = self._point_id(note)
            if not force and self._is_current(point_id, content_hash, note):
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

    def _is_current(self, point_id: str, content_hash: str, note: VaultNote) -> bool:
        existing = self.qdrant.retrieve(
            collection_name=self.config.qdrant_collection,
            ids=[point_id],
            with_payload=True,
            with_vectors=False,
        )
        payload = existing[0].payload if existing else None
        return bool(
            payload
            and payload.get("content_hash") == content_hash
            and payload.get("content_type") == note.content_type
            and payload.get("document_id") == note.id
            and payload.get("path") == note.path
        )

    def _embedding_text(self, note: VaultNote) -> str:
        return (
            f"type: {note.content_type}\n"
            f"folder: {' > '.join(self._folder_names(note.folder_id))}\n"
            f"title: {note.title}\n"
            f"slug: {note.slug}\n"
            f"tags: {note.tags}\n"
            f"content:\n{note.content}"
        )[:8000]

    @staticmethod
    def _point_id(note: VaultNote) -> str:
        document_key = note.id if note.content_type == "vault" else f"{note.content_type}:{note.id}"
        return str(uuid.uuid5(uuid.NAMESPACE_URL, f"kscold-vault-note:{document_key}"))
