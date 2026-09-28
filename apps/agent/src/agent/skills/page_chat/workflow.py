from __future__ import annotations

from threading import BoundedSemaphore
from typing import Callable, Iterator

import httpx

from agent.prompts.page_chat import page_chat_messages
from agent.skills.page_chat.models import PageChatInput


class PageChatSkill:
    """검색·색인·저장 도구가 없는 페이지 인용 자료 전용 생성 경로입니다."""

    def __init__(self, model: str, openai):
        self.model = model
        self.openai = openai.with_options(max_retries=0)
        self._provider_slots = BoundedSemaphore(2)

    def stream(self, data: PageChatInput, is_active: Callable[[], bool], register_cancel=None) -> Iterator[tuple[str, object]]:
        data.validate()
        if not is_active():
            return
        stages = [{"name": "페이지 자료 확인", "detail": "이 페이지에 제시된 자료만 참고합니다."}]
        yield "stage", stages[-1]
        stages.append({"name": "근거에 맞춰 답변", "detail": "수치의 조건과 개인·팀의 역할을 구분해 설명합니다."})
        yield "stage", stages[-1]
        if not is_active():
            return
        chunks: list[str] = []
        for delta in self._answer_deltas(data, is_active, register_cancel):
            chunks.append(delta)
            yield "delta", delta
        if is_active():
            answer = "".join(chunks).strip()
            if not answer:
                raise RuntimeError("페이지 Agent의 답변이 비어 있습니다.")
            yield "completed", {"answer": answer, "stages": stages}

    def _answer_deltas(self, data, is_active, register_cancel):
        if not self._provider_slots.acquire(blocking=False):
            raise RuntimeError("페이지 Agent가 처리 중입니다. 잠시 후 다시 시도해주세요.")
        size = 0
        stream = None
        try:
            if not is_active():
                return
            # 초기 HTTP 응답을 기다리는 요청도 실제 종료할 때까지 슬롯을 유지합니다.
            stream = self.openai.chat.completions.create(
                model=self.model, temperature=0.2, stream=True, store=False, max_tokens=900,
                timeout=httpx.Timeout(20.0, connect=5.0, pool=5.0, write=5.0),
                messages=page_chat_messages(data),
            )
            if register_cancel is not None and not register_cancel(stream.close):
                return
            for chunk in stream:
                if not is_active():
                    return
                delta = chunk.choices[0].delta.content if chunk.choices else None
                if not delta:
                    continue
                bounded = delta[:max(0, 3600 - size)]
                size += len(bounded)
                if bounded:
                    yield bounded
                if size >= 3600:
                    break
        finally:
            try:
                if stream is not None:
                    stream.close()
            finally:
                self._provider_slots.release()
