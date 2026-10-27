from __future__ import annotations

import json
import re
from typing import Iterator
from openai import Timeout

from agent.prompts.vault_chat import answer_messages, follow_up_messages
from agent.tools.models import ContentAccessScope, SearchHit
from agent.tools.stream_control import StreamControl
from agent.tools.intent import missing_records_answer, query_intent


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
        intent = query_intent(question)
        if not context and (intent.content_types or intent.recent):
            return missing_records_answer(question)
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
        intent = query_intent(question)
        if not context and (intent.content_types or intent.recent):
            yield missing_records_answer(question)
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
        if not context:
            return []
        try:
            response = self.openai.with_options(max_retries=0).chat.completions.create(
                model=self.config.openai_chat_model,
                temperature=0.2,
                timeout=Timeout(10.0, connect=5.0, pool=5.0, write=5.0),
                messages=follow_up_messages(question, answer, context),
            )
            raw = response.choices[0].message.content or ""
            return self._grounded_follow_ups(raw, context)
        except Exception:
            return []

    @staticmethod
    def _grounded_follow_ups(raw: str, context: list[SearchHit]) -> list[str]:
        """제안마다 인용한 기록의 실제 구절을 확인하고 화면에는 질문만 전달한다."""
        try:
            suggestions = json.loads(raw)
        except (ValueError, TypeError):
            return []
        if not isinstance(suggestions, list):
            return []
        questions: list[str] = []
        for item in suggestions:
            if not isinstance(item, dict):
                continue
            index, topic, question = item.get("source"), item.get("topic"), item.get("question")
            if not isinstance(index, int) or isinstance(index, bool) or not 1 <= index <= len(context):
                continue
            if not isinstance(topic, str) or not isinstance(question, str):
                continue
            note = context[index - 1].note
            evidence = f"{note.title} {' '.join(note.tags)} {note.content[:2400]}".casefold()
            topic, question = topic.strip(), question.strip()
            named_terms = re.findall(r"[a-zA-Z][a-zA-Z0-9.+#-]*|\d+(?:\.\d+)*", question)
            if (len(topic) >= 2 and topic.casefold() in evidence and topic.casefold() in question.casefold()
                    and all(term.casefold() in evidence for term in named_terms)
                    and 5 <= len(question) <= 100 and question not in questions):
                questions.append(question)
        return questions[:3]
