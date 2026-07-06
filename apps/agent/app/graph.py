from __future__ import annotations

from dataclasses import dataclass, field
from typing import TypedDict

from langgraph.graph import END, StateGraph

from app.config import AgentConfig
from app.tools.store import SearchHit, VaultStore
from app.tools.web_search import WebSearchTool


class AgentState(TypedDict):
    question: str
    active_folder_name: str
    hits: list[SearchHit]
    context: list[SearchHit]
    web_results: list[str]
    answer: str
    stages: list[dict[str, str]]


@dataclass
class VaultRagGraph:
    config: AgentConfig
    store: VaultStore = field(init=False)
    web_search: WebSearchTool = field(init=False)

    def __post_init__(self) -> None:
        self.store = VaultStore(self.config)
        self.web_search = WebSearchTool(self.config, self.store.openai)
        graph = StateGraph(AgentState)
        graph.add_node("retrieve", self.retrieve)
        graph.add_node("expand", self.expand)
        graph.add_node("web_search", self.search_web)
        graph.add_node("answer", self.answer)
        graph.set_entry_point("retrieve")
        graph.add_edge("retrieve", "expand")
        graph.add_edge("expand", "web_search")
        graph.add_edge("web_search", "answer")
        graph.add_edge("answer", END)
        self.app = graph.compile()

    def retrieve(self, state: AgentState) -> AgentState:
        hits = self.store.search(state["question"], self.config.max_context_notes)
        state["hits"] = hits
        state["stages"].append(
            {
                "name": "Retrieve",
                "detail": f"Qdrant에서 Vault 노트 상위 {len(hits)}개를 검색했습니다.",
            }
        )
        return state

    def expand(self, state: AgentState) -> AgentState:
        context = self.store.expand_graph(state["hits"], self.config.max_context_notes + 3)
        state["context"] = context
        state["stages"].append(
            {
                "name": "Graph Expand",
                "detail": "outgoingLinks/backlinks 주변 노트를 확장 컨텍스트로 더했습니다.",
            }
        )
        return state

    def search_web(self, state: AgentState) -> AgentState:
        if not self.config.web_search_enabled:
            state["web_results"] = []
            return state

        try:
            results = self.web_search.search(state["question"])
        except Exception:
            state["web_results"] = []
            state["stages"].append(
                {
                    "name": "Web Search",
                    "detail": "웹검색 도구 호출에 실패해 Vault 노트만으로 답변합니다.",
                }
            )
            return state

        state["web_results"] = [result.snippet for result in results]
        state["stages"].append(
            {
                "name": "Web Search",
                "detail": f"최신 정보 보강용 웹검색 결과 {len(results)}개를 확인했습니다.",
            }
        )
        return state

    def answer(self, state: AgentState) -> AgentState:
        answer = self.store.answer(
            state["question"],
            state["active_folder_name"],
            state["context"],
            state.get("web_results", []),
        )
        state["answer"] = answer
        state["stages"].append(
            {
                "name": "Respond",
                "detail": f"{self.config.openai_chat_model}로 근거 노트를 반영해 답변했습니다.",
            }
        )
        self.store.log_run(state["question"], answer, state["context"])
        return state

    def chat(self, question: str, active_folder_name: str) -> AgentState:
        return self.app.invoke(
            {
                "question": question,
                "active_folder_name": active_folder_name,
                "hits": [],
                "context": [],
                "web_results": [],
                "answer": "",
                "stages": [
                    {
                        "name": "Plan",
                        "detail": "질문을 임베딩하고 Vault RAG 그래프 실행 계획을 세웠습니다.",
                    }
                ],
            }
        )

    def reindex(self, force: bool = False) -> tuple[int, int, int]:
        return self.store.reindex(force=force)
