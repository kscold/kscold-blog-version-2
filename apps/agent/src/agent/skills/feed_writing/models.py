from __future__ import annotations

from dataclasses import dataclass

from agent.tools.models import SearchHit


STYLE_INSTRUCTIONS = {
    "short": "짧고 밀도 있게 쓴다. 3~5개의 짧은 문단을 넘기지 않는다.",
    "developer": "개발자가 실제로 기록한 듯 구현 맥락과 배운 점을 구체적으로 쓴다.",
    "candid": "과장하지 않고, 확신과 고민을 구분해 조금 더 솔직하게 쓴다.",
    "calm": "논쟁을 만들지 않는 차분한 어조로 쓴다. 단정적 평가와 자극적인 표현은 피한다.",
    "warm": "읽는 사람이 맥락을 빠르게 이해하도록 부드럽고 친절하게 쓴다.",
}


@dataclass(frozen=True)
class ExternalSource:
    """서버가 안전하게 추출한 외부 글의 최소 맥락입니다."""

    url: str = ""
    title: str = ""
    description: str = ""
    site_name: str = ""
    content: str = ""


@dataclass(frozen=True)
class FeedCopilotPlan:
    """사용자가 확인한 뒤에만 초안 생성에 쓰는 작성 방향입니다."""

    title: str
    angle: str
    key_points: list[str]
    source_summary: str
    sources: list[SearchHit]


@dataclass(frozen=True)
class FeedCopilotDraft:
    """자동 발행하지 않고 작성 화면에만 적용하는 피드 초안입니다."""

    title: str
    content: str
    tags: list[str]
    sources: list[SearchHit]
