from __future__ import annotations

from agent.tools.models import VaultNote


class VaultDocumentMapperMixin:
    """컬렉션마다 다른 MongoDB 구조를 검색 공통 모델로 변환합니다."""

    @staticmethod
    def _to_note(document: dict) -> VaultNote:
        slug = document.get("slug") or ""
        return VaultNote(
            id=str(document.get("_id")),
            title=document.get("title") or "",
            slug=slug,
            content=document.get("content") or "",
            folder_id=document.get("folderId"),
            outgoing_links=list(document.get("outgoingLinks") or []),
            tags=list(document.get("tags") or []),
            content_type="vault",
            path=f"/vault/{slug}",
        )

    @staticmethod
    def _to_post(document: dict) -> VaultNote:
        category = document.get("category") or {}
        tags = [
            tag.get("name", "")
            for tag in document.get("tags") or []
            if isinstance(tag, dict)
        ]
        slug = document.get("slug") or ""
        category_slug = category.get("slug") or "blog"
        return VaultNote(
            id=str(document.get("_id")),
            title=document.get("title") or "블로그 글",
            slug=slug,
            content="\n".join(
                part
                for part in [document.get("excerpt") or "", document.get("content") or ""]
                if part
            ),
            folder_id=None,
            outgoing_links=[],
            tags=tags,
            content_type="blog",
            path=f"/blog/{category_slug}/{slug}",
        )

    @staticmethod
    def _to_feed(document: dict) -> VaultNote:
        preview = document.get("linkPreview") or {}
        feed_id = str(document.get("_id"))
        return VaultNote(
            id=feed_id,
            title=preview.get("title") or (document.get("content") or "피드")[:48],
            slug=feed_id,
            content="\n".join(
                part
                for part in [
                    document.get("content") or "",
                    preview.get("description") or "",
                ]
                if part
            ),
            folder_id=None,
            outgoing_links=[],
            tags=list(document.get("tags") or []),
            content_type="feed",
            path=f"/feed/{feed_id}",
        )
