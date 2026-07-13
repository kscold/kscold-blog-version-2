from __future__ import annotations

from dataclasses import dataclass, field
import threading
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
    follow_ups: list[str]
    stages: list[dict[str, str]]


@dataclass
class VaultRagGraph:
    config: AgentConfig
    store: VaultStore = field(init=False)
    web_search: WebSearchTool = field(init=False)
    _stop_event: threading.Event = field(default_factory=threading.Event, init=False)
    _sync_thread: threading.Thread | None = field(default=None, init=False)

    def __post_init__(self) -> None:
        self.store = VaultStore(self.config)
        self.web_search = WebSearchTool(self.config, self.store.openai)
        graph = StateGraph(AgentState)
        graph.add_node("retrieve", self.retrieve)
        graph.add_node("expand", self.expand)
        graph.add_node("web_search", self.search_web)
        graph.add_node("respond", self.answer)
        graph.set_entry_point("retrieve")
        graph.add_edge("retrieve", "expand")
        graph.add_edge("expand", "web_search")
        graph.add_edge("web_search", "respond")
        graph.add_edge("respond", END)
        self.app = graph.compile()

    def start_index_sync(self) -> None:
        if self._sync_thread is not None or self.config.index_sync_interval_seconds <= 0:
            return

        self._sync_thread = threading.Thread(
            target=self._index_sync_loop,
            name="vault-agent-index-sync",
            daemon=True,
        )
        self._sync_thread.start()

    def stop_index_sync(self) -> None:
        self._stop_event.set()
        if self._sync_thread is not None:
            self._sync_thread.join(timeout=2)

    def _index_sync_loop(self) -> None:
        self._sync_once()
        while not self._stop_event.wait(self.config.index_sync_interval_seconds):
            self._sync_once()

    def _sync_once(self) -> None:
        try:
            total, indexed, skipped = self.reindex()
            print(
                f"Vault Agent index sync total={total} indexed={indexed} skipped={skipped}",
                flush=True,
            )
        except Exception as exception:
            print(f"Vault Agent index sync failed: {exception}", flush=True)

    def retrieve(self, state: AgentState) -> AgentState:
        scoped_question = " ".join(
            part
            for part in [
                state.get("active_folder_name", ""),
                state["question"],
            ]
            if part
        )
        hits = self.store.search(
            scoped_question,
            self.config.max_context_notes,
            state.get("active_folder_name", ""),
        )
        state["hits"] = hits
        state["stages"].append(
            {
                "name": "Retrieve",
                "detail": f"질문과 가까운 Vault 후보 노트 {len(hits)}개를 찾았습니다.",
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
        if not self.config.web_search_enabled or not self._needs_web_search(state["question"]):
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

    def _needs_web_search(self, question: str) -> bool:
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

    def answer(self, state: AgentState) -> AgentState:
        answer = self.store.answer(
            state["question"],
            state["active_folder_name"],
            state["context"],
            state.get("web_results", []),
        )
        state["answer"] = answer
        state["follow_ups"] = self.store.follow_ups(
            state["question"],
            answer,
            state["context"],
        )
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
                "follow_ups": [],
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
