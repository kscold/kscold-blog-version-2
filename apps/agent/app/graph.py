from __future__ import annotations

from dataclasses import dataclass, field
import threading
from typing import Iterator, TypedDict

from langgraph.graph import END, StateGraph

from app.config import AgentConfig
from app.tools.store import ContentAccessScope, SearchHit, VaultStore
from app.tools.web_search import WebSearchTool


class AgentState(TypedDict):
    question: str
    active_folder_name: str
    content_access_scope: ContentAccessScope
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
                f"Vault Agent 색인 동기화 완료: 전체={total}, 신규={indexed}, 유지={skipped}",
                flush=True,
            )
        except Exception as exception:
            print(f"Vault Agent 색인 동기화 실패: {exception}", flush=True)

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
        context = self.store.expand_graph(
            state["hits"],
            self.config.max_context_notes + 3,
            state["content_access_scope"],
        )
        state["context"] = context
        state["stages"].append(
            {
                "name": "맥락 연결",
                "detail": "링크와 백링크를 따라 필요한 주변 기록을 함께 확인했습니다.",
            }
        )
        return state

    def search_web(self, state: AgentState) -> AgentState:
        if not self.config.web_search_enabled or not self._needs_web_search(state["question"]):
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
        state["answer"] = self.store.answer(
            state["question"],
            state["active_folder_name"],
            state["context"],
            state.get("web_results", []),
            state["content_access_scope"],
        )
        return self._finish_answer(state)

    def chat(
        self,
        question: str,
        active_folder_name: str,
        content_access_scope: ContentAccessScope | None = None,
    ) -> AgentState:
        return self.app.invoke(
            self._initial_state(question, active_folder_name, content_access_scope)
        )

    def stream_chat(
        self,
        question: str,
        active_folder_name: str,
        content_access_scope: ContentAccessScope | None = None,
    ) -> Iterator[tuple[str, dict[str, str] | str | AgentState]]:
        state = self._initial_state(question, active_folder_name, content_access_scope)
        yield "stage", state["stages"][-1]

        self.retrieve(state)
        yield "stage", state["stages"][-1]

        self.expand(state)
        yield "stage", state["stages"][-1]

        self.search_web(state)
        yield "stage", state["stages"][-1]

        state["stages"].append(
            {
                "name": "답변 작성",
                "detail": "찾은 기록을 바탕으로 답변을 정리하고 있습니다.",
            }
        )
        yield "stage", state["stages"][-1]

        chunks: list[str] = []
        for delta in self.store.answer_stream(
            state["question"],
            state["active_folder_name"],
            state["context"],
            state.get("web_results", []),
            state["content_access_scope"],
        ):
            chunks.append(delta)
            yield "delta", delta

        state["answer"] = "".join(chunks).strip()
        self._finish_answer(state)
        yield "completed", state

    def _initial_state(
        self,
        question: str,
        active_folder_name: str,
        content_access_scope: ContentAccessScope | None,
    ) -> AgentState:
        return {
            "question": question,
            "active_folder_name": active_folder_name,
            "content_access_scope": content_access_scope or ContentAccessScope(),
            "hits": [],
            "context": [],
            "web_results": [],
            "answer": "",
            "follow_ups": [],
            "stages": [
                {
                    "name": "질문 정리",
                    "detail": "질문의 핵심과 필요한 기록 범위를 정리했습니다.",
                }
            ],
        }

    def _finish_answer(self, state: AgentState) -> AgentState:
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

    def reindex(self, force: bool = False) -> tuple[int, int, int]:
        return self.store.reindex(force=force)
