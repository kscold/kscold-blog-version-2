from __future__ import annotations

import re

from bson import ObjectId


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


class VaultQueryMixin:
    """질문 정규화와 폴더·링크 탐색에 필요한 작은 보조 기능을 모읍니다."""

    def _query_terms(self, query: str) -> list[str]:
        raw_terms = [
            term.strip()
            for term in re.split(r"[\s,./|:;()\[\]{}<>!?\"'`~]+", query)
            if len(term.strip()) >= 2
        ]
        terms: list[str] = []
        for term in raw_terms:
            lower = term.lower()
            for variant in (term, lower, self._strip_korean_particles(lower)):
                if len(variant) >= 2:
                    terms.append(variant)
        return list(dict.fromkeys(terms))[:24]

    def _strip_korean_particles(self, term: str) -> str:
        for particle in (
            "에서는",
            "에게서",
            "으로부터",
            "에서",
            "으로",
            "로",
            "과",
            "와",
            "은",
            "는",
            "이",
            "가",
            "을",
            "를",
            "의",
        ):
            if term.endswith(particle) and len(term) > len(particle) + 1:
                return term[: -len(particle)]
        return term

    def _language_hints(self, terms: list[str]) -> set[str]:
        return {
            folder_hint
            for term in terms
            if (folder_hint := LANGUAGE_FOLDER_HINTS.get(term.lower()))
        }

    def _folder_names(self, folder_id: object) -> list[str]:
        if not folder_id:
            return []
        folder = self.folders.find_one(
            {"_id": folder_id}, {"name": 1, "parent": 1, "ancestors": 1}
        )
        if not folder and ObjectId.is_valid(str(folder_id)):
            folder = self.folders.find_one(
                {"_id": ObjectId(str(folder_id))}, {"name": 1, "parent": 1, "ancestors": 1}
            )
        if not folder:
            return []

        ancestor_ids = list(folder.get("ancestors") or [])
        names: list[str] = []
        if ancestor_ids:
            lookup_ids: list[object] = []
            for ancestor_id in ancestor_ids:
                lookup_ids.append(ancestor_id)
                if ObjectId.is_valid(str(ancestor_id)):
                    lookup_ids.append(ObjectId(str(ancestor_id)))
            ancestors = self.folders.find({"_id": {"$in": lookup_ids}}, {"_id": 1, "name": 1})
            name_by_id = {
                str(document["_id"]): str(document.get("name") or "").lower()
                for document in ancestors
            }
            names.extend(name_by_id.get(str(ancestor_id), "") for ancestor_id in ancestor_ids)
        names.append(str(folder.get("name") or "").lower())
        return [name for name in names if name]

    def _content_focus_terms(self, terms: list[str]) -> list[str]:
        language_aliases = set(LANGUAGE_FOLDER_HINTS) | set(LANGUAGE_FOLDER_HINTS.values())
        return [
            term.lower()
            for term in terms
            if len(term) >= 2
            and term.lower() not in language_aliases
            and term.lower() not in FOCUS_STOP_TERMS
        ][:8]

    @staticmethod
    def _extract_wiki_links(content: str) -> list[str]:
        if not content:
            return []
        links = re.findall(r"\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|[^\]]+)?\]\]", content)
        links.extend(re.findall(r"\]\(/vault/([^)#]+)(?:#[^)]+)?\)", content))
        return links

    @staticmethod
    def _link_candidates(reference: str) -> list[str]:
        value = reference.strip().removeprefix("/vault/").removesuffix(".md")
        without_anchor = value.split("#", 1)[0].strip()
        without_alias = without_anchor.split("|", 1)[0].strip()
        return list(
            dict.fromkeys(
                candidate
                for candidate in (
                    reference.strip(),
                    value,
                    without_anchor,
                    without_alias,
                    without_alias.replace(" ", "-"),
                )
                if candidate
            )
        )
