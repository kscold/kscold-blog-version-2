from __future__ import annotations

from agent.tools.models import ContentAccessScope, SearchHit


def answer_messages(
    question: str,
    active_folder_name: str,
    context: list[SearchHit],
    web_results: list[str] | None,
    scope: ContentAccessScope,
) -> list[dict[str, str]]:
    """권한으로 걸러진 문서와 웹 보강 자료만 포함한 답변 프롬프트를 만듭니다."""

    context_text = "\n---\n".join(
        f"[S{index}]\n"
        f"type: {hit.note.content_type}\n"
        f"title: {hit.note.title}\n"
        f"path: {hit.note.path or f'/vault/{hit.note.slug}'}\n"
        f"tags: {hit.note.tags}\n"
        f"score: {hit.score:.4f}\n"
        f"content:\n{hit.note.content[:2400]}"
        for index, hit in enumerate(context, start=1)
    )
    access_description = {
        "full": "관리자 전체 열람 범위",
        "granted": "공개 기록과 승인된 열람 범위",
        "public": "공개 기록 범위",
    }[scope.access_level()]
    web_context = "\n---\n".join(web_results or []) or "없음"
    return [
        {
            "role": "system",
            "content": (
                "너는 KSCOLD의 공개 블로그 글, 피드, Vault 기록과 소개 페이지를 찾아 답하는 Agent다. "
                "제공된 검색 결과는 현재 사용자에게 허용된 기록만 담고 있으므로, 그 결과만 내부 기록의 근거로 사용한다. "
                "검색 결과에 없는 비공개 내용이나 권한 밖의 내용을 추측하거나 암시하지 않는다. "
                "김승찬은 자연스럽게 '승찬님'이라고 부르되 방문자를 승찬님으로 단정하지 않는다. "
                "친근하고 존중하는 어조를 쓰되 과장된 아부나 역할극은 피한다. "
                "김승찬, kscold, 블로그 주인 관련 질문은 프로필 기록을 우선 참고한다. "
                "비교 질문은 각 대상을 구분해 설명하고, 근거가 충분하면 읽기 쉬운 표를 사용한다. "
                "검색된 기록을 근거로 한 문장 뒤에는 해당 기록 번호를 `【S1】` 형식으로 붙인다. "
                "검색 결과에 없는 핵심 설명은 모델의 일반 지식으로 보강할 수 있지만, 해당 문단 첫머리에 '일반 지식 보강:'을 명시한다. "
                "웹 검색 결과는 최신성 확인이 필요할 때만 보조 근거로 사용한다. 한국어로 자연스럽고 간결하게 답한다."
            ),
        },
        {
            "role": "user",
            "content": (
                f"현재 열람 범위: {access_description}\n"
                f"선택된 폴더: {active_folder_name or '전체 기록'}\n"
                f"질문: {question}\n\n"
                f"검색된 기록:\n{context_text or '관련 기록을 찾지 못했습니다.'}\n\n"
                f"웹 검색 보강:\n{web_context}"
            ),
        },
    ]


def follow_up_messages(question: str, answer: str, context: list[SearchHit]) -> list[dict[str, str]]:
    """답변 맥락에 맞는 후속 질문만 만들 수 있도록 최소 자료를 전달합니다."""

    context_text = "\n---\n".join(
        f"type: {hit.note.content_type}\ntitle: {hit.note.title}\ntags: {hit.note.tags}"
        for hit in context
    )
    return [
        {
            "role": "system",
            "content": (
                "너는 KSCOLD 블로그, 피드, Vault 기록과 소개 페이지 대화의 흐름을 이어가는 도우미다. "
                "블로그 주인 김승찬은 '승찬님'이라고 자연스럽게 지칭한다. "
                "방금 나온 답변에서 더 깊이 파고들거나 인접 주제로 확장하는 한국어 후속 질문 3개를 만든다. "
                "각 질문은 25자 내외로 짧고 구체적이어야 하며, 이미 답한 내용을 반복하지 않는다. "
                "한 줄에 하나씩 질문만 출력한다."
            ),
        },
        {
            "role": "user",
            "content": f"직전 질문: {question}\n\n방금 답변:\n{answer}\n\n참고 기록:\n{context_text}",
        },
    ]
