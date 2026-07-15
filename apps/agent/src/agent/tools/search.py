from __future__ import annotations

import re

from bson import ObjectId

from agent.tools.models import ContentAccessScope, SearchHit
from agent.tools.profile import profile_query_matches, public_profile_note


class VaultSearchMixin:
    """Qdrant 의미 검색, MongoDB 키워드 검색, 링크 확장을 같은 권한 범위로 실행합니다."""

    def search(
        self,
        query: str,
        limit: int,
        active_folder_name: str = "",
        scope: ContentAccessScope | None = None,
    ) -> list[SearchHit]:
        access_scope = scope or ContentAccessScope()
        folder_ids = self.resolve_folder_scope(active_folder_name)
        keyword_hits = self.keyword_search(query, limit * 2, folder_ids, access_scope)
        if self.qdrant.count(collection_name=self.config.qdrant_collection, exact=True).count == 0:
            return keyword_hits[:limit]
        try:
            vector_hits = self._vector_search(query, limit, folder_ids, access_scope)
        except Exception:
            return keyword_hits[:limit]
        return self._merge_search_hits(
            vector_hits,
            keyword_hits,
            limit,
            self._language_hints(self._query_terms(query)),
        )

    def _vector_search(
        self,
        query: str,
        limit: int,
        folder_ids: set[str | ObjectId],
        scope: ContentAccessScope,
    ) -> list[SearchHit]:
        response = self.qdrant.search(
            collection_name=self.config.qdrant_collection,
            query_vector=self.embed_text(query),
            # 후보는 넉넉히 받고 원본 MongoDB 권한을 반드시 다시 적용합니다.
            limit=max(limit * 5, 25),
            with_payload=True,
        )
        scored_refs = [
            (
                hit,
                str(hit.payload.get("content_type") or "vault"),
                str(hit.payload.get("document_id") or hit.payload.get("note_id")),
            )
            for hit in response
            if hit.payload and (hit.payload.get("document_id") or hit.payload.get("note_id"))
        ]
        documents = self._fetch_index_documents(
            [(content_type, document_id) for _, content_type, document_id in scored_refs], scope
        )
        if folder_ids:
            documents = {
                key: note
                for key, note in documents.items()
                if note.content_type != "vault"
                or note.folder_id in folder_ids
                or str(note.folder_id) in folder_ids
            }
        return [
            SearchHit(note=documents[f"{content_type}:{document_id}"], score=float(hit.score) + 1)
            for hit, content_type, document_id in scored_refs
            if f"{content_type}:{document_id}" in documents
        ]

    def keyword_search(
        self,
        query: str,
        limit: int,
        folder_ids: set[str | ObjectId] | None = None,
        scope: ContentAccessScope | None = None,
    ) -> list[SearchHit]:
        access_scope = scope or ContentAccessScope()
        terms = self._query_terms(query)
        language_hints = self._language_hints(terms)
        folder_filter = {"folderId": {"$in": list(folder_ids)}} if folder_ids else {}
        vault_filter = self._vault_access_filter(access_scope)
        if not terms:
            query_filter = {"$and": [vault_filter, folder_filter]} if folder_filter else vault_filter
            return [
                SearchHit(note=self._to_note(document), score=0.35)
                for document in self.notes.find(query_filter).limit(limit)
            ]
        conditions = [
            condition
            for term in terms
            for condition in (
                {"title": {"$regex": re.escape(term), "$options": "i"}},
                {"content": {"$regex": re.escape(term), "$options": "i"}},
                {"tags": {"$regex": re.escape(term), "$options": "i"}},
            )
        ]
        query_filter = (
            {"$and": [vault_filter, folder_filter, {"$or": conditions}]}
            if folder_filter
            else {"$and": [vault_filter, {"$or": conditions}]}
        )
        candidates = [self._to_note(document) for document in self.notes.find(query_filter).limit(800)]
        if not folder_ids:
            candidates.extend(self._post_candidates(conditions, access_scope))
            candidates.extend(self._feed_candidates(conditions, access_scope))
            profile = public_profile_note()
            if profile_query_matches(query, terms) or self._note_matches_query_focus(profile, terms):
                candidates.append(profile)
        scored = [
            SearchHit(
                note=candidate,
                score=self._keyword_score(candidate, terms, language_hints, bool(folder_ids)),
            )
            for candidate in candidates
        ]
        if not folder_ids and profile_query_matches(query, terms):
            scored.append(SearchHit(note=public_profile_note(), score=12.0))
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
        folder_id = folder["_id"]
        descendants = self.folders.find(
            {
                "$or": [
                    {"ancestors": folder_id},
                    {"ancestors": str(folder_id)},
                    {"parent": folder_id},
                    {"parent": str(folder_id)},
                ]
            },
            {"_id": 1},
        )
        descendant_ids = [document["_id"] for document in descendants]
        return {folder_id, str(folder_id), *descendant_ids, *(str(item) for item in descendant_ids)}

    def expand_graph(
        self, hits: list[SearchHit], limit: int, scope: ContentAccessScope | None = None
    ) -> list[SearchHit]:
        access_scope = scope or ContentAccessScope()
        seen = {hit.note.id for hit in hits}
        expanded = list(hits)
        references: list[str] = []
        for hit in hits:
            references.extend(link for link in hit.note.outgoing_links if link not in seen)
            references.extend(self._extract_wiki_links(hit.note.content))
            backlinks = self.notes.find(
                {
                    "$and": [
                        self._vault_access_filter(access_scope),
                        {"outgoingLinks": {"$in": [hit.note.id, hit.note.slug, hit.note.title]}},
                    ]
                }
            ).limit(5)
            references.extend(str(document["_id"]) for document in backlinks)
        for note in self.resolve_link_notes(references, limit, access_scope):
            if note.id not in seen:
                seen.add(note.id)
                expanded.append(SearchHit(note=note, score=0.5))
            if len(expanded) >= limit:
                break
        return expanded
