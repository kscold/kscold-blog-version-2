from __future__ import annotations

from typing import TypedDict

from agent.tools.models import ContentAccessScope, SearchHit


class AgentStage(TypedDict):
    """사용자 화면에 보여줄 Agent 처리 단계입니다."""

    name: str
    detail: str


class AgentState(TypedDict):
    """한 번의 Vault Agent 질의에서만 유지하는 실행 상태입니다."""

    question: str
    active_folder_name: str
    content_access_scope: ContentAccessScope
    hits: list[SearchHit]
    context: list[SearchHit]
    web_results: list[str]
    answer: str
    follow_ups: list[str]
    stages: list[AgentStage]


def initial_state(
    question: str,
    active_folder_name: str,
    content_access_scope: ContentAccessScope | None,
) -> AgentState:
    """요청마다 공유되지 않는 새 상태를 만들어 이전 대화와 섞이지 않게 합니다."""
    return {
        "question": question,
        "active_folder_name": active_folder_name,
        "content_access_scope": content_access_scope or ContentAccessScope(),
        "hits": [],
        "context": [],
        "web_results": [],
        "answer": "",
        "follow_ups": [],
        "stages": [
            {
                "name": "질문 정리",
                "detail": "질문의 핵심과 필요한 기록 범위를 정리했습니다.",
            }
        ],
    }
