from __future__ import annotations

from typing import Iterator

from agent.config import AgentConfig
from agent.graph.state.vault_chat_state import AgentStage, AgentState
from agent.graph.workflow.vault_rag_workflow import VaultRagGraph
from agent.skills.feed_writing.models import ExternalSource, FeedCopilotDraft, FeedCopilotPlan
from agent.skills.feed_writing.workflow import FeedCopilotGraph
from agent.tools.models import ContentAccessScope, SearchHit


class VaultAgentApplication:
    """gRPC 요청이 Agent 그래프와 작성 Skill을 일관되게 호출하게 하는 진입점입니다."""

    def __init__(self, config: AgentConfig):
        self.rag_graph = VaultRagGraph(config)
        self.feed_writing = FeedCopilotGraph(config, self.rag_graph.store)

    def chat(
        self,
        question: str,
        active_folder_name: str,
        scope: ContentAccessScope,
    ) -> AgentState:
        return self.rag_graph.chat(question, active_folder_name, scope)

    def stream_chat(
        self,
        question: str,
        active_folder_name: str,
        scope: ContentAccessScope,
    ) -> Iterator[tuple[str, AgentStage | str | AgentState]]:
        return self.rag_graph.stream_chat(question, active_folder_name, scope)

    def create_feed_plan(
        self,
        memo: str,
        source: ExternalSource,
        styles: list[str],
        scope: ContentAccessScope,
    ) -> FeedCopilotPlan:
        return self.feed_writing.create_plan(memo, source, styles, scope)

    def create_feed_draft(
        self,
        memo: str,
        source: ExternalSource,
        styles: list[str],
        plan_title: str,
        plan_angle: str,
        plan_key_points: list[str],
        style_reference_keys: list[str],
        scope: ContentAccessScope,
    ) -> FeedCopilotDraft:
        return self.feed_writing.create_draft(
            memo,
            source,
            styles,
            plan_title,
            plan_angle,
            plan_key_points,
            style_reference_keys,
            scope,
        )

    def reindex(self, force: bool) -> tuple[int, int, int]:
        return self.rag_graph.reindex(force=force)

    def source_excerpt(self, hit: SearchHit, question: str) -> str:
        return self.rag_graph.store.source_excerpt(hit, question)

    def start(self) -> None:
        self.rag_graph.start_index_sync()

    def stop(self) -> None:
        self.rag_graph.stop_index_sync()
