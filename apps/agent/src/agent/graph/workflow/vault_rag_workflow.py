from __future__ import annotations

from dataclasses import dataclass, field
import threading
from typing import Iterator

from langgraph.graph import END, StateGraph

from agent.config import AgentConfig
from agent.graph.nodes.vault_rag_nodes import VaultRagNodes
from agent.graph.state.vault_chat_state import AgentStage, AgentState, initial_state
from agent.tools.capabilities import WebSearchTool
from agent.tools.models import ContentAccessScope
from agent.tools.store import VaultStore


@dataclass
class VaultRagGraph:
    """Vault 검색과 답변 생성을 조합하고 색인 동기화 수명주기를 관리합니다."""

    config: AgentConfig
    store: VaultStore = field(init=False)
    nodes: VaultRagNodes = field(init=False)
    _stop_event: threading.Event = field(default_factory=threading.Event, init=False)
    _sync_thread: threading.Thread | None = field(default=None, init=False)

    def __post_init__(self) -> None:
        self.store = VaultStore(self.config)
        self.nodes = VaultRagNodes(
            self.config,
            self.store,
            WebSearchTool(self.config, self.store.openai),
        )
        self.app = self._build_graph()

    def chat(
        self,
        question: str,
        active_folder_name: str,
        content_access_scope: ContentAccessScope | None = None,
    ) -> AgentState:
        return self.app.invoke(initial_state(question, active_folder_name, content_access_scope))

    def stream_chat(
        self,
        question: str,
        active_folder_name: str,
        content_access_scope: ContentAccessScope | None = None,
    ) -> Iterator[tuple[str, AgentStage | str | AgentState]]:
        state = initial_state(question, active_folder_name, content_access_scope)
        yield "stage", state["stages"][-1]

        for node in (self.nodes.retrieve, self.nodes.expand, self.nodes.search_web):
            node(state)
            yield "stage", state["stages"][-1]

        self.nodes.add_answer_stage(state)
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
        self.nodes.complete(state)
        yield "completed", state

    def reindex(self, force: bool = False) -> tuple[int, int, int]:
        return self.store.reindex(force=force)

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

    def _build_graph(self):
        graph = StateGraph(AgentState)
        graph.add_node("retrieve", self.nodes.retrieve)
        graph.add_node("expand", self.nodes.expand)
        graph.add_node("web_search", self.nodes.search_web)
        graph.add_node("respond", self.nodes.answer)
        graph.add_node("complete", self.nodes.complete)
        graph.set_entry_point("retrieve")
        graph.add_edge("retrieve", "expand")
        graph.add_edge("expand", "web_search")
        graph.add_edge("web_search", "respond")
        graph.add_edge("respond", "complete")
        graph.add_edge("complete", END)
        return graph.compile()

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
