from __future__ import annotations

import re

from agent.tools.models import SearchHit, VaultNote


class VaultRankingMixin:
    """벡터·키워드 후보를 합치고 비교 질문의 언어별 균형을 보장합니다."""

    @staticmethod
    def _dedupe_hits(hits: list[SearchHit], limit: int) -> list[SearchHit]:
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
        candidates = sorted([*keyword_hits, *vector_hits], key=lambda hit: hit.score, reverse=True)
        for language_hint in sorted(language_hints):
            exclusive = [
                hit
                for hit in candidates
                if self._note_matches_language(hit.note, language_hint)
                and not any(
                    other != language_hint and self._note_matches_language(hit.note, other)
                    for other in language_hints
                )
            ]
            language_candidates = exclusive or [
                hit for hit in candidates if self._note_matches_language(hit.note, language_hint)
            ]
            for hit in language_candidates:
                key = f"{hit.note.content_type}:{hit.note.id}"
                if key not in selected_keys:
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

    def _balanced_hits(
        self, hits: list[SearchHit], language_hints: set[str], terms: list[str], limit: int
    ) -> list[SearchHit]:
        if len(language_hints) <= 1 or limit <= 2:
            return hits[:limit]
        selected: list[SearchHit] = []
        selected_ids: set[str] = set()
        per_language_target = max(1, min(2, limit // len(language_hints)))
        for hint in sorted(language_hints):
            language_hits = [hit for hit in hits if self._note_matches_language(hit.note, hint)]
            focused = [hit for hit in language_hits if self._note_matches_query_focus(hit.note, terms)]
            for hit in (focused or language_hits)[:per_language_target]:
                if hit.note.id not in selected_ids:
                    selected.append(hit)
                    selected_ids.add(hit.note.id)
        for hit in hits:
            if len(selected) >= limit:
                break
            if hit.note.id not in selected_ids:
                selected.append(hit)
                selected_ids.add(hit.note.id)
        return selected[:limit]

    def _note_matches_language(self, note: VaultNote, language_hint: str) -> bool:
        if any(language_hint == name for name in self._folder_names(note.folder_id)):
            return True
        combined = f"{note.title} {note.slug} {' '.join(note.tags)}".lower()
        if re.fullmatch(r"[a-z0-9.+#-]+", language_hint):
            return re.search(
                rf"(?<![a-z0-9]){re.escape(language_hint)}(?![a-z0-9])", combined
            ) is not None
        return language_hint in combined

    def _note_matches_query_focus(self, note: VaultNote, terms: list[str]) -> bool:
        focus_terms = self._content_focus_terms(terms)
        if not focus_terms:
            return True
        combined = f"{note.title} {note.slug} {' '.join(note.tags)} {note.content[:1200]}".lower()
        return any(term in combined for term in focus_terms)

    def _keyword_score(
        self, note: VaultNote, terms: list[str], language_hints: set[str], scoped: bool
    ) -> float:
        title_lower = note.title.lower()
        slug_lower = note.slug.lower()
        content_lower = note.content.lower()
        tags_lower = " ".join(note.tags).lower()
        score = 0.25
        for term in terms:
            lower = term.lower()
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
        if language_hints:
            folder_names = self._folder_names(note.folder_id)
            for hint in language_hints:
                if any(hint == name or hint in name for name in folder_names):
                    score += 2 if scoped else 5
        if ("차이" in terms or "비교" in terms or "difference" in terms) and len(language_hints) >= 2:
            score += 1.5
        return round(score, 4)
