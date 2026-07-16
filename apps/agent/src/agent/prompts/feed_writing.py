from __future__ import annotations

import json
import re

from agent.skills.feed_writing.models import ExternalSource, STYLE_INSTRUCTIONS
from agent.skills.feed_writing.state import FeedCopilotState
from agent.tools.models import SearchHit


def plan_messages(state: FeedCopilotState) -> list[dict[str, str]]:
    """사용자가 검토할 계획만 만들도록 모델 입력을 구성합니다."""

    return [
        {
            "role": "system",
            "content": (
                "너는 KSCOLD Feed Copilot이다. 사용자가 남긴 메모와 외부 자료, "
                "KSCOLD의 관련 공개 기록을 바탕으로 피드 초안의 방향만 설계한다. "
                "외부 글을 길게 베끼지 말고 핵심을 자기 언어로 풀 수 있는 방향을 잡는다. "
                "사용자가 실제로 한 경험으로 확인되지 않은 일을 지어내지 않는다. "
                "반드시 JSON 객체만 반환한다. 형식은 "
                '{"title":"첫 문장 제안","angle":"기록의 관점","keyPoints":["핵심 1","핵심 2","핵심 3"],"sourceSummary":"외부 자료와 관련 기록을 어떻게 사용할지"} 이다.'
            ),
        },
        {"role": "user", "content": plan_prompt(state)},
    ]


def draft_messages(state: FeedCopilotState) -> list[dict[str, str]]:
    """승인된 계획에서만 피드 초안을 만들도록 모델 입력을 구성합니다."""

    return [
        {
            "role": "system",
            "content": (
                "너는 KSCOLD Feed Copilot이다. 사용자가 검토한 계획을 바탕으로 "
                "KSCOLD 피드에 올릴 한국어 초안을 작성한다. 결과는 자동 발행되지 않는 초안이다. "
                "피드는 읽기 쉬운 3~6개의 짧은 문단으로 쓰고, 제목·소제목·마크다운·출처 표기·해시태그를 본문에 넣지 않는다. "
                "외부 글의 문장을 길게 복사하지 않고, 사실은 제공된 자료에서만 사용한다. "
                "메모에 없는 개인 경험이나 성과를 만들어내지 않는다. "
                "선택한 말투 참고 기록은 문장 길이, 문단 리듬, 직접성만 참고하고 원문 표현이나 그 기록의 사건을 가져오지 않는다. "
                "반드시 JSON 객체만 반환한다. 형식은 "
                '{"title":"첫 문장 제안","content":"본문","tags":["태그1","태그2","태그3"]} 이다. 태그에는 #을 붙이지 않는다.'
            ),
        },
        {"role": "user", "content": draft_prompt(state)},
    ]


def parse_json(content: str) -> dict[str, object]:
    """모델이 코드 블록을 섞어도 JSON 객체만 안전하게 회수합니다."""

    try:
        parsed = json.loads(content)
        return parsed if isinstance(parsed, dict) else {}
    except json.JSONDecodeError:
        matched = re.search(r"\{.*\}", content, flags=re.DOTALL)
        if not matched:
            return {}
        try:
            parsed = json.loads(matched.group(0))
            return parsed if isinstance(parsed, dict) else {}
        except json.JSONDecodeError:
            return {}


def text(value: object, fallback: str) -> str:
    if not isinstance(value, str):
        return fallback
    cleaned = re.sub(r"\s+", " ", value).strip()
    return cleaned[:240] or fallback


def body_text(value: object, fallback: str) -> str:
    """피드 본문은 문단 구조를 보존하고 지나치게 긴 응답만 안전하게 제한합니다."""

    if not isinstance(value, str):
        return fallback

    paragraphs = []
    for paragraph in re.split(r"\n\s*\n", value.replace("\r\n", "\n")):
        cleaned = re.sub(r"[ \t]+", " ", paragraph).strip()
        if cleaned:
            paragraphs.append(cleaned)

    normalized = "\n\n".join(paragraphs).strip()
    return normalized[:4000].rstrip() or fallback


def text_list(value: object, limit: int) -> list[str]:
    if not isinstance(value, list):
        return []
    result: list[str] = []
    for item in value:
        if not isinstance(item, str):
            continue
        cleaned = re.sub(r"\s+", " ", item).strip()
        if cleaned and cleaned not in result:
            result.append(cleaned[:180])
    return result[:limit]


def tags(value: object) -> list[str]:
    normalized: list[str] = []
    for tag in text_list(value, limit=5):
        cleaned = re.sub(r"[^0-9A-Za-z가-힣_+.#-]", "", tag.lstrip("#"))
        if cleaned and cleaned not in normalized:
            normalized.append(cleaned[:24])
    return normalized


def plan_prompt(state: FeedCopilotState) -> str:
    return "\n\n".join(
        [
            f"작성 메모:\n{state['memo'] or '없음'}",
            f"선택한 문체:\n{style_text(state['styles'])}",
            f"선택한 말투 참고 기록:\n{style_reference_text(state['style_references'])}",
            f"외부 자료:\n{source_text(state['source'])}",
            f"KSCOLD 관련 기록:\n{context_text(state['context'])}",
        ]
    )


def draft_prompt(state: FeedCopilotState) -> str:
    plan = "\n".join(
        [
            f"첫 문장 제안: {state['plan_title']}",
            f"기록 관점: {state['plan_angle']}",
            "핵심 흐름: " + ", ".join(state["plan_key_points"]),
        ]
    )
    return "\n\n".join(
        [
            f"작성 메모:\n{state['memo'] or '없음'}",
            f"사용자가 확인한 계획:\n{plan}",
            f"선택한 문체:\n{style_text(state['styles'])}",
            f"선택한 말투 참고 기록:\n{style_reference_text(state['style_references'])}",
            f"외부 자료:\n{source_text(state['source'])}",
            f"KSCOLD 관련 기록:\n{context_text(state['context'])}",
        ]
    )


def style_text(styles: list[str]) -> str:
    instructions = [STYLE_INSTRUCTIONS[style] for style in styles if style in STYLE_INSTRUCTIONS]
    return " ".join(instructions) or "담백하고 읽기 쉽게 쓴다."


def style_reference_text(references: list[SearchHit]) -> str:
    if not references:
        return "선택하지 않음"
    return "\n---\n".join(
        f"기록 {index}: {hit.note.title}\n"
        f"유형: {hit.note.content_type}\n"
        f"말투 참고용 본문: {hit.note.content[:1400]}"
        for index, hit in enumerate(references[:2], start=1)
    )


def source_text(source: ExternalSource) -> str:
    if not any([source.url, source.title, source.description, source.content]):
        return "없음"
    return "\n".join(
        value
        for value in [
            f"URL: {source.url}" if source.url else "",
            f"제목: {source.title}" if source.title else "",
            f"설명: {source.description}" if source.description else "",
            f"본문 발췌: {source.content[:8000]}" if source.content else "",
        ]
        if value
    )


def context_text(context: list[SearchHit]) -> str:
    if not context:
        return "관련 기록을 찾지 못했습니다."
    return "\n---\n".join(
        f"기록 {index}: {hit.note.title}\n"
        f"유형: {hit.note.content_type}\n"
        f"내용: {hit.note.content[:1200]}"
        for index, hit in enumerate(context[:4], start=1)
    )
