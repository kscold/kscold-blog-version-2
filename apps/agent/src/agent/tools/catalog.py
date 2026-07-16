from __future__ import annotations

from agent.tools.models import ContentAccessScope, VaultNote
from agent.tools.profile import public_profile_note


class VaultCatalogMixin:
    """MongoDB 원본을 검색 문서로 읽고, 실제 권한으로 다시 검증합니다."""

    def iter_notes(self, scope: ContentAccessScope | None = None) -> list[VaultNote]:
        access_scope = scope or ContentAccessScope()
        return [
            self._to_note(document)
            for document in self.notes.find(self._vault_access_filter(access_scope))
        ]

    def iter_index_documents(self) -> list[VaultNote]:
        full_scope = ContentAccessScope.full_access()
        return [
            *self.iter_notes(full_scope),
            *self._post_candidates([], full_scope, limit=1000),
            *self._feed_candidates([], full_scope, limit=2000),
            public_profile_note(),
        ]

    def fetch_notes(
        self, note_ids: list[str], scope: ContentAccessScope | None = None
    ) -> list[VaultNote]:
        if not note_ids:
            return []
        access_scope = scope or ContentAccessScope()
        documents = self.notes.find(
            {
                "$and": [
                    self._vault_access_filter(access_scope),
                    {"_id": {"$in": self._mongo_ids(note_ids)}},
                ]
            }
        )
        note_by_id = {str(document["_id"]): self._to_note(document) for document in documents}
        return [note_by_id[note_id] for note_id in note_ids if note_id in note_by_id]

    def fetch_index_documents_by_keys(
        self, document_keys: list[str], scope: ContentAccessScope | None = None
    ) -> list[VaultNote]:
        """선택한 출처 키를 권한 필터로 다시 검증해 말투 참고 기록으로 돌려줍니다."""

        access_scope = scope or ContentAccessScope()
        references: list[tuple[str, str]] = []
        for key in document_keys:
            content_type, separator, document_id = key.partition(":")
            if not separator or not document_id:
                continue
            if content_type not in {"vault", "blog", "feed", "profile"}:
                continue
            references.append((content_type, document_id))

        documents = self._fetch_index_documents(references, access_scope)
        return [
            documents[f"{content_type}:{document_id}"]
            for content_type, document_id in references
            if f"{content_type}:{document_id}" in documents
        ]

    def resolve_link_notes(
        self,
        references: list[str],
        limit: int,
        scope: ContentAccessScope | None = None,
    ) -> list[VaultNote]:
        normalized = [
            candidate
            for reference in references
            if reference and reference.strip()
            for candidate in self._link_candidates(reference)
        ]
        if not normalized:
            return []
        access_scope = scope or ContentAccessScope()
        documents = self.notes.find(
            {
                "$and": [
                    self._vault_access_filter(access_scope),
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

    def _post_candidates(
        self, conditions: list[dict], scope: ContentAccessScope, limit: int = 120
    ) -> list[VaultNote]:
        post_conditions: list[dict] = []
        for condition in conditions:
            if "title" in condition:
                post_conditions.append({"title": condition["title"]})
            if "content" in condition:
                post_conditions.extend(
                    [{"content": condition["content"]}, {"excerpt": condition["content"]}]
                )
            if "tags" in condition:
                post_conditions.append({"tags.name": condition["tags"]})
        access_filter = self._post_access_filter(scope)
        query_filter = (
            {"$and": [access_filter, {"$or": post_conditions}]}
            if post_conditions
            else access_filter
        )
        return [self._to_post(document) for document in self.posts.find(query_filter).limit(limit)]

    def _feed_candidates(
        self, conditions: list[dict], scope: ContentAccessScope, limit: int = 120
    ) -> list[VaultNote]:
        feed_conditions: list[dict] = []
        for condition in conditions:
            if "title" in condition:
                feed_conditions.append({"linkPreview.title": condition["title"]})
            if "content" in condition:
                feed_conditions.append({"content": condition["content"]})
            if "tags" in condition:
                feed_conditions.append({"tags": condition["tags"]})
        access_filter = self._feed_access_filter(scope)
        query_filter = (
            {"$and": [access_filter, {"$or": feed_conditions}]}
            if feed_conditions
            else access_filter
        )
        return [self._to_feed(document) for document in self.feeds.find(query_filter).limit(limit)]

    def _fetch_index_documents(
        self, refs: list[tuple[str, str]], scope: ContentAccessScope
    ) -> dict[str, VaultNote]:
        refs_by_type: dict[str, list[str]] = {}
        for content_type, document_id in refs:
            refs_by_type.setdefault(content_type, []).append(document_id)

        documents: dict[str, VaultNote] = {}
        for note in self.fetch_notes(refs_by_type.get("vault", []), scope):
            documents[f"vault:{note.id}"] = note
        for content_type, collection, filter_factory, mapper in (
            ("blog", self.posts, self._post_access_filter, self._to_post),
            ("feed", self.feeds, self._feed_access_filter, self._to_feed),
        ):
            document_ids = refs_by_type.get(content_type, [])
            if not document_ids:
                continue
            query = {
                "$and": [
                    filter_factory(scope),
                    {"_id": {"$in": self._mongo_ids(document_ids)}},
                ]
            }
            for document in collection.find(query):
                note = mapper(document)
                documents[f"{content_type}:{note.id}"] = note
        if refs_by_type.get("profile"):
            profile = public_profile_note()
            documents[f"profile:{profile.id}"] = profile
        return documents
