from __future__ import annotations

from dataclasses import dataclass, field


@dataclass(frozen=True)
class VaultNote:
    """Vault·블로그·피드를 하나의 검색 문서로 다루기 위한 최소 모델입니다."""

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
    """검색 점수와 함께 실제 문서를 전달해 후속 노드가 다시 조회하지 않게 합니다."""

    note: VaultNote
    score: float


@dataclass(frozen=True)
class ContentAccessScope:
    """Spring API가 계산한 열람 범위를 모든 Agent 도구에 동일하게 적용합니다."""

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
                value.strip()
                for value in (allowed_post_ids or [])
                if value and value.strip()
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
