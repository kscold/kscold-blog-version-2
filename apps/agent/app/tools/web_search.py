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

        response = self.openai.chat.completions.create(
            model=self.config.web_search_model,
            web_search_options={},
            messages=[
                {
                    "role": "user",
                    "content": f"KSCOLD Vault 답변 보강용으로 최신 웹 자료를 짧게 찾아줘: {query}",
                }
            ],
        )
        message = response.choices[0].message
        text = message.content or ""
        if not text.strip():
            return []

        citations = []
        for annotation in getattr(message, "annotations", []) or []:
            url_citation = getattr(annotation, "url_citation", None)
            url = getattr(url_citation, "url", "") if url_citation else ""
            title = getattr(url_citation, "title", "") if url_citation else ""
            if url:
                citations.append(f"- {title or '웹 출처'}: {url}")

        if citations:
            text = f"{text.strip()}\n\n웹 출처:\n" + "\n".join(dict.fromkeys(citations))

        return [
            WebSearchResult(
                title="Web search",
                url="",
                snippet=text.strip()[:1600],
            )
        ]
