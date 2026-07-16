from __future__ import annotations

from dataclasses import dataclass

from agent.config import AgentConfig
from agent.prompts.feed_writing import draft_messages, parse_json, plan_messages
from agent.skills.feed_writing.state import FeedCopilotState
from agent.tools.store import VaultStore


@dataclass
class FeedCopilotNodes:
    """피드 초안 생성에서 검색·계획·초안 작성을 각각 맡는 LangGraph 노드입니다."""

    config: AgentConfig
    store: VaultStore

    def retrieve(self, state: FeedCopilotState) -> FeedCopilotState:
        source = state["source"]
        query = "\n".join(
            value
            for value in [
                state["memo"],
                source.title,
                source.description,
                source.content[:1800],
            ]
            if value
        )
        hits = self.store.search(
            query or source.url,
            self.config.max_context_notes,
            "",
            state["content_access_scope"],
        )
        state["context"] = self.store.expand_graph(
            hits,
            self.config.max_context_notes + 2,
            state["content_access_scope"],
        )
        state["style_references"] = [
            SearchHit(note=note, score=1.0)
            for note in self.store.fetch_index_documents_by_keys(
                state["style_reference_keys"], state["content_access_scope"]
            )
        ]
        return state

    def plan(self, state: FeedCopilotState) -> FeedCopilotState:
        state["plan"] = self._json_completion(plan_messages(state))
        return state

    def draft(self, state: FeedCopilotState) -> FeedCopilotState:
        state["draft"] = self._json_completion(draft_messages(state))
        return state

    def _json_completion(self, messages: list[dict[str, str]]) -> dict[str, object]:
        try:
            response = self.store.openai.chat.completions.create(
                model=self.config.openai_chat_model,
                temperature=0.45,
                response_format={"type": "json_object"},
                messages=messages,
            )
            return parse_json(response.choices[0].message.content or "{}")
        except Exception:
            return {}
