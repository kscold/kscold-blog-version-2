from __future__ import annotations

from bson import ObjectId

from agent.tools.models import ContentAccessScope


class VaultAccessMixin:
    """문서 종류와 무관하게 같은 권한 필터를 적용하는 조회 전용 기능입니다."""

    def _post_access_filter(self, scope: ContentAccessScope) -> dict:
        if scope.full_content_access:
            return {}
        conditions = self._public_post_visibility_conditions()
        if scope.allowed_post_ids:
            conditions.append({"_id": {"$in": self._mongo_ids(list(scope.allowed_post_ids))}})
        if scope.allowed_category_ids:
            conditions.append({"category.id": {"$in": list(scope.allowed_category_ids)}})
        return {"status": "PUBLISHED", "$or": conditions}

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

    @staticmethod
    def _vault_access_filter(scope: ContentAccessScope) -> dict:
        if scope.full_content_access:
            return {}
        return {
            "$or": [
                {"visibility": {"$exists": False}},
                {"visibility": None},
                {"visibility": "PUBLIC"},
                {"public": True},
                {"publicOverride": True},
            ]
        }

    @staticmethod
    def _feed_access_filter(scope: ContentAccessScope) -> dict:
        return {} if scope.full_content_access else {"visibility": "PUBLIC"}

    @staticmethod
    def _mongo_ids(ids: list[str]) -> list[object]:
        values: list[object] = []
        for value in ids:
            values.append(value)
            if ObjectId.is_valid(value):
                values.append(ObjectId(value))
        return values
