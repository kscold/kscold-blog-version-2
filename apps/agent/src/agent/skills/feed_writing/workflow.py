from __future__ import annotations

import re

from langgraph.graph import END, StateGraph

from agent.config import AgentConfig
from agent.prompts.feed_writing import body_text, tags, text, text_list
from agent.skills.feed_writing.models import ExternalSource, FeedCopilotDraft, FeedCopilotPlan
from agent.skills.feed_writing.nodes import FeedCopilotNodes
from agent.skills.feed_writing.state import FeedCopilotState, initial_state
from agent.tools.models import ContentAccessScope
from agent.tools.store import VaultStore


class FeedCopilotGraph:
    """계획 확인 후 초안을 만드는 두 개의 짧은 LangGraph 흐름을 조합합니다."""

    def __init__(self, config: AgentConfig, store: VaultStore):
        self.nodes = FeedCopilotNodes(config, store)
        self.plan_app = self._build_graph("plan")
        self.draft_app = self._build_graph("draft")

    def create_plan(
        self,
        memo: str,
        source: ExternalSource,
        styles: list[str],
        content_access_scope: ContentAccessScope,
    ) -> FeedCopilotPlan:
        state = self.plan_app.invoke(initial_state(memo, source, styles, content_access_scope))
        plan = state["plan"]
        return FeedCopilotPlan(
            title=text(plan.get("title"), self._fallback_title(memo, source)),
            angle=text(plan.get("angle"), self._fallback_angle(memo, source)),
            key_points=text_list(plan.get("keyPoints"), limit=4)
            or self._fallback_key_points(memo, source),
            source_summary=text(
                plan.get("sourceSummary"), self._fallback_source_summary(source)
            ),
            sources=state["context"][:4],
        )

    def create_draft(
        self,
        memo: str,
        source: ExternalSource,
        styles: list[str],
        plan_title: str,
        plan_angle: str,
        plan_key_points: list[str],
        style_reference_keys: list[str],
        content_access_scope: ContentAccessScope,
    ) -> FeedCopilotDraft:
        state = initial_state(
            memo,
            source,
            styles,
            content_access_scope,
            style_reference_keys,
        )
        state["plan_title"] = plan_title
        state["plan_angle"] = plan_angle
        state["plan_key_points"] = plan_key_points
        result = self.draft_app.invoke(state)
        draft = result["draft"]
        return FeedCopilotDraft(
            title=text(draft.get("title"), plan_title or self._fallback_title(memo, source)),
            content=body_text(draft.get("content"), self._fallback_draft(memo, source)),
            tags=tags(draft.get("tags")),
            sources=self._sources(result["style_references"], result["context"]),
        )

    def _build_graph(self, action: str):
        node_name = f"generate_{action}"
        graph = StateGraph(FeedCopilotState)
        graph.add_node("retrieve", self.nodes.retrieve)
        graph.add_node(node_name, getattr(self.nodes, action))
        graph.set_entry_point("retrieve")
        graph.add_edge("retrieve", node_name)
        graph.add_edge(node_name, END)
        return graph.compile()

    @staticmethod
    def _sources(
        style_references: list[SearchHit], context: list[SearchHit]
    ) -> list[SearchHit]:
        sources: list[SearchHit] = []
        seen: set[tuple[str, str]] = set()
        for hit in [*style_references, *context]:
            key = (hit.note.content_type, hit.note.id)
            if key in seen:
                continue
            seen.add(key)
            sources.append(hit)
            if len(sources) == 4:
                break
        return sources

    @staticmethod
    def _fallback_title(memo: str, source: ExternalSource) -> str:
        if memo:
            return re.sub(r"\s+", " ", memo).strip()[:72]
        return source.title[:72] if source.title else "오늘 공유하고 싶은 이야기"

    @staticmethod
    def _fallback_angle(memo: str, source: ExternalSource) -> str:
        if memo:
            return "메모에서 출발해 지금 생각한 이유와 다음에 확인할 지점을 남깁니다."
        if source.title:
            return "외부 자료에서 인상 깊었던 지점을 내 작업 맥락으로 다시 정리합니다."
        return "핵심을 짧게 남기고 다음 대화를 열 수 있게 정리합니다."

    @staticmethod
    def _fallback_key_points(memo: str, source: ExternalSource) -> list[str]:
        points = [
            "무엇을 보고 기록하게 되었는지",
            "내 작업과 어떻게 연결되는지",
            "다음에 확인할 질문",
        ]
        if memo:
            points[0] = "메모에서 가장 먼저 남기고 싶은 생각"
        if source.title:
            points[0] = f"{source.title}에서 눈에 띈 지점"
        return points

    @staticmethod
    def _fallback_source_summary(source: ExternalSource) -> str:
        if source.title:
            return "외부 자료의 핵심을 내 관점으로 짧게 풀고, 확인이 필요한 사실은 원문 링크로 남깁니다."
        return "작성 메모와 관련 기록을 바탕으로 초안의 맥락을 잡습니다."

    @staticmethod
    def _fallback_draft(memo: str, source: ExternalSource) -> str:
        if memo:
            return memo.strip()
        if source.description:
            return source.description.strip()
        if source.title:
            return f"{source.title}를 보며 남겨두고 싶은 생각입니다."
        return ""
