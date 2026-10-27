from __future__ import annotations

from typing import Iterator
from openai import Timeout

from agent.prompts.vault_chat import answer_messages, follow_up_messages
from agent.tools.models import ContentAccessScope, SearchHit
from agent.tools.stream_control import StreamControl


class VaultAnsweringMixin:
    """검색 결과를 답변과 후속 질문으로 바꾸는 LLM 호출만 담당합니다."""

    def answer(
        self,
        question: str,
        active_folder_name: str,
        context: list[SearchHit],
        web_results: list[str] | None = None,
        scope: ContentAccessScope | None = None,
    ) -> str:
        response = self.openai.with_options(max_retries=0).chat.completions.create(
            model=self.config.openai_chat_model,
            temperature=0.2,
            timeout=Timeout(30.0, connect=5.0, pool=5.0, write=5.0),
            messages=answer_messages(
                question,
                active_folder_name,
                context,
                web_results,
                scope or ContentAccessScope(),
            ),
        )
        return response.choices[0].message.content or ""

    def answer_stream(
        self,
        question: str,
        active_folder_name: str,
        context: list[SearchHit],
        web_results: list[str] | None = None,
        scope: ContentAccessScope | None = None,
        control: StreamControl | None = None,
    ) -> Iterator[str]:
        control = control or StreamControl()
        if not control.is_active():
            return
        response = self.openai.with_options(max_retries=0).chat.completions.create(
            model=self.config.openai_chat_model,
            temperature=0.2,
            stream=True,
            timeout=Timeout(20.0, connect=5.0, pool=5.0, write=5.0),
            messages=answer_messages(
                question,
                active_folder_name,
                context,
                web_results,
                scope or ContentAccessScope(),
            ),
        )
        try:
            if control.register_cancel is not None and not control.register_cancel(response.close):
                return
            for chunk in response:
                if not control.is_active():
                    return
                if chunk.choices and (delta := chunk.choices[0].delta.content):
                    yield delta
        finally:
            response.close()

    def follow_ups(
        self, question: str, answer: str, context: list[SearchHit]
    ) -> list[str]:
        try:
            response = self.openai.with_options(max_retries=0).chat.completions.create(
                model=self.config.openai_chat_model,
                temperature=0.5,
                timeout=Timeout(10.0, connect=5.0, pool=5.0, write=5.0),
                messages=follow_up_messages(question, answer, context),
            )
            raw = response.choices[0].message.content or ""
            questions = [
                line.strip().lstrip("-•*0123456789.)· ").strip()
                for line in raw.splitlines()
            ]
            return [question for question in questions if question][:3]
        except Exception:
            return []
