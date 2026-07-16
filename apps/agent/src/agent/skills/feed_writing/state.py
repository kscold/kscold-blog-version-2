from __future__ import annotations

from typing import TypedDict

from agent.skills.feed_writing.models import ExternalSource, STYLE_INSTRUCTIONS
from agent.tools.models import ContentAccessScope, SearchHit


class FeedCopilotState(TypedDict):
    """계획 또는 초안 생성 한 번에만 사용하는 LangGraph 상태입니다."""

    memo: str
    source: ExternalSource
    styles: list[str]
    style_reference_keys: list[str]
    content_access_scope: ContentAccessScope
    plan_title: str
    plan_angle: str
    plan_key_points: list[str]
    context: list[SearchHit]
    style_references: list[SearchHit]
    plan: dict[str, object]
    draft: dict[str, object]


def initial_state(
    memo: str,
    source: ExternalSource,
    styles: list[str],
    content_access_scope: ContentAccessScope,
    style_reference_keys: list[str] | None = None,
) -> FeedCopilotState:
    """허용된 문체와 길이만 반영해 요청마다 독립된 작성 상태를 만듭니다."""

    return {
        "memo": memo.strip()[:4000],
        "source": source,
        "styles": [style for style in styles if style in STYLE_INSTRUCTIONS],
        "style_reference_keys": list(dict.fromkeys(style_reference_keys or []))[:2],
        "content_access_scope": content_access_scope,
        "plan_title": "",
        "plan_angle": "",
        "plan_key_points": [],
        "context": [],
        "style_references": [],
        "plan": {},
        "draft": {},
    }
