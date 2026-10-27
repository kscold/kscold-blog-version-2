from __future__ import annotations

import re
from dataclasses import replace

from agent.tools.models import ContentAccessScope, SearchHit, SearchOptions, VaultNote
from agent.tools.profile import public_profile_note


class VaultCatalogMixin:
    """MongoDB 원본을 검색 문서로 읽고, 실제 권한으로 다시 검증합니다."""

    def recent_records(self, topic: str, options: SearchOptions, folder_ids: set) -> list[SearchHit]:
        """주제 결과가 비면 권한·출처·폴더를 유지한 최신 조회를 한 번만 수행한다."""
        terms = self._query_terms(topic)
        hits = self._recent_candidates(terms, options, folder_ids)
        if hits or not terms:
            return hits
        return [
            replace(hit, topic_fallback=True)
            for hit in self._recent_candidates([], options, folder_ids)
        ]

    def _recent_candidates(self, terms: list[str], options: SearchOptions, folder_ids: set) -> list[SearchHit]:
        hits: list[SearchHit] = []
        for kind, collection, access, mapper, fields in (
            ("vault", self.notes, self._vault_access_filter, self._to_note, ("title", "content", "tags")),
            ("blog", self.posts, self._post_access_filter, self._to_post, ("title", "content", "excerpt", "tags.name")),
            ("feed", self.feeds, self._feed_access_filter, self._to_feed, ("content", "tags", "linkPreview.title", "linkPreview.description")),
        ):
            if options.content_types and kind not in options.content_types:
                continue
            if folder_ids and kind != "vault" and not options.content_types:
                continue
            filters = [access(options.scope)]
            if folder_ids and kind == "vault":
                filters.append({"folderId": {"$in": list(folder_ids)}})
            if terms:
                filters.append({"$or": [
                    {field: {"$regex": re.escape(term), "$options": "i"}}
                    for term in terms for field in fields
                ]})
            documents = collection.find({"$and": filters}).sort([("createdAt", -1), ("_id", -1)]).limit(options.limit)
            hits.extend(SearchHit(note=mapper(document), score=1.0) for document in documents)
        # 컬렉션별 limit은 정렬 후에 적용해야 오래된 기록이 최신 기록을 밀어내지 않는다.
        hits.sort(key=lambda hit: (hit.note.created_at, hit.note.content_type, hit.note.id), reverse=True)
        return hits[:options.limit]

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
