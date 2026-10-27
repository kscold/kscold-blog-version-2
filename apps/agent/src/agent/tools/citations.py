from __future__ import annotations

import re

from agent.tools.models import SearchHit


def cited_records(answer: str, context: list[SearchHit]) -> tuple[str, list[SearchHit]]:
    """사용한 출처만 남기고 본문 번호와 응답 출처 배열을 함께 다시 매긴다."""
    pattern = r"【S(\d+)】"
    indices = sorted({
        int(match) - 1 for match in re.findall(pattern, answer)
        if 0 < int(match) <= len(context)
    })
    numbers = {index + 1: number for number, index in enumerate(indices, start=1)}
    normalized = re.sub(
        pattern,
        lambda match: f"【S{numbers[int(match[1])]}】" if int(match[1]) in numbers else "",
        answer,
    )
    return normalized, [context[index] for index in indices]
