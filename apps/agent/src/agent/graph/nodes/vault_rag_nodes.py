from __future__ import annotations

from dataclasses import dataclass

from agent.config import AgentConfig
from agent.graph.state.vault_chat_state import AgentState
from agent.tools.capabilities import WebSearchTool
from agent.tools.store import VaultStore


@dataclass
class VaultRagNodes:
    """검색·연결·웹 확인·답변처럼 재사용 가능한 LangGraph 노드를 모읍니다."""

    config: AgentConfig
    store: VaultStore
    web_search: WebSearchTool

    def retrieve(self, state: AgentState) -> AgentState:
        scoped_question = " ".join(
            part
            for part in [state.get("active_folder_name", ""), state["question"]]
            if part
        )
        hits = self.store.search(
            scoped_question,
            self.config.max_context_notes,
            state.get("active_folder_name", ""),
            state["content_access_scope"],
        )
        state["hits"] = hits
        state["stages"].append(
            {
                "name": "기록 찾기",
                "detail": f"질문과 가까운 기록 {len(hits)}개를 찾았습니다.",
            }
        )
        return state

    def expand(self, state: AgentState) -> AgentState:
        state["context"] = self.store.expand_graph(
            state["hits"],
            self.config.max_context_notes + 3,
            state["content_access_scope"],
        )
        state["stages"].append(
            {
                "name": "맥락 연결",
                "detail": "링크와 백링크를 따라 필요한 주변 기록을 함께 확인했습니다.",
            }
        )
        return state

    def search_web(self, state: AgentState) -> AgentState:
        if not self.config.web_search_enabled or not self.needs_web_search(state["question"]):
            state["web_results"] = []
            state["stages"].append(
                {
                    "name": "최신 정보 확인",
                    "detail": "이번 질문은 내부 기록을 우선 확인해 답할 수 있습니다.",
                }
            )
            return state

        try:
            results = self.web_search.search(state["question"])
        except Exception:
            state["web_results"] = []
            state["stages"].append(
                {
                    "name": "최신 정보 확인",
                    "detail": "웹 확인은 건너뛰고 찾은 기록을 바탕으로 답합니다.",
                }
            )
            return state

        state["web_results"] = [result.snippet for result in results]
        state["stages"].append(
            {
                "name": "최신 정보 확인",
                "detail": f"최신성 확인을 위해 웹 자료 {len(results)}건을 함께 살폈습니다.",
            }
        )
        return state

    def answer(self, state: AgentState) -> AgentState:
        state["answer"] = self.store.answer(
            state["question"],
            state["active_folder_name"],
            state["context"],
            state.get("web_results", []),
            state["content_access_scope"],
        )
        return state

    def complete(self, state: AgentState) -> AgentState:
        state["follow_ups"] = self.store.follow_ups(
            state["question"],
            state["answer"],
            state["context"],
        )
        state["stages"].append(
            {
                "name": "답변 완료",
                "detail": "참고한 기록과 함께 답변을 정리했습니다.",
            }
        )
        self.store.log_run(
            state["question"],
            state["answer"],
            state["context"],
            state["content_access_scope"],
        )
        return state

    def add_answer_stage(self, state: AgentState) -> AgentState:
        state["stages"].append(
            {
                "name": "답변 작성",
                "detail": "찾은 기록을 바탕으로 답변을 정리하고 있습니다.",
            }
        )
        return state

    @staticmethod
    def needs_web_search(question: str) -> bool:
        return any(
            keyword in question.lower()
            for keyword in (
                "최신",
                "최근",
                "현재",
                "오늘",
                "이번",
                "뉴스",
                "공식 문서",
                "업데이트",
            )
        )
