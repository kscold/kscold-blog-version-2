from __future__ import annotations

from typing import Iterator

from agent.prompts.vault_chat import answer_messages, follow_up_messages
from agent.tools.models import ContentAccessScope, SearchHit


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
        response = self.openai.chat.completions.create(
            model=self.config.openai_chat_model,
            temperature=0.2,
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
    ) -> Iterator[str]:
        response = self.openai.chat.completions.create(
            model=self.config.openai_chat_model,
            temperature=0.2,
            stream=True,
            messages=answer_messages(
                question,
                active_folder_name,
                context,
                web_results,
                scope or ContentAccessScope(),
            ),
        )
        for chunk in response:
            if chunk.choices and (delta := chunk.choices[0].delta.content):
                yield delta

    def follow_ups(
        self, question: str, answer: str, context: list[SearchHit]
    ) -> list[str]:
        try:
            response = self.openai.chat.completions.create(
                model=self.config.openai_chat_model,
                temperature=0.5,
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
