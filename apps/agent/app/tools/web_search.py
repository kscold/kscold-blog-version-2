from __future__ import annotations

from dataclasses import dataclass

from openai import OpenAI

from app.config import AgentConfig


@dataclass(frozen=True)
class WebSearchResult:
    title: str
    url: str
    snippet: str


class WebSearchTool:
    def __init__(self, config: AgentConfig, openai: OpenAI):
        self.config = config
        self.openai = openai

    def search(self, query: str) -> list[WebSearchResult]:
        if not self.config.web_search_enabled:
            return []

        response = self.openai.responses.create(
            model=self.config.web_search_model,
            tools=[{"type": "web_search_preview"}],
            input=f"KSCOLD Vault 답변 보강용으로 최신 웹 자료를 짧게 찾아줘: {query}",
        )
        text = getattr(response, "output_text", "") or ""
        if not text.strip():
            return []

        return [
            WebSearchResult(
                title="Web search",
                url="",
                snippet=text.strip()[:1600],
            )
        ]
