from __future__ import annotations

import re
from datetime import datetime, timezone

from agent.tools.models import ContentAccessScope, SearchHit


class VaultObservabilityMixin:
    """운영 화면에서 조회할 실행 기록과 출처 발췌문을 남깁니다."""

    def log_run(
        self,
        question: str,
        answer: str,
        sources: list[SearchHit],
        scope: ContentAccessScope | None = None,
    ) -> None:
        access_scope = scope or ContentAccessScope()
        self.runs.insert_one(
            {
                "question": question,
                "answer": answer,
                "sourceCount": len(sources),
                "accessLevel": access_scope.access_level(),
                "createdAt": datetime.now(timezone.utc),
                "sources": [
                    {
                        "noteId": hit.note.id,
                        "title": hit.note.title,
                        "slug": hit.note.slug,
                        "score": hit.score,
                        "type": hit.note.content_type,
                        "path": hit.note.path or f"/vault/{hit.note.slug}",
                        "excerpt": self.source_excerpt(hit, question),
                    }
                    for hit in sources
                ],
            }
        )

    def source_excerpt(self, hit: SearchHit, question: str, limit: int = 220) -> str:
        """질문과 가장 가까운 기록 구간을 출처 카드에서 바로 읽게 합니다."""

        content = re.sub(r"\s+", " ", hit.note.content).strip()
        if not content:
            return ""
        positions = [
            content.lower().find(term)
            for term in self._content_focus_terms(self._query_terms(question))
            if content.lower().find(term) >= 0
        ]
        if not positions:
            return self._truncate_excerpt(content, 0, limit)
        start = max(0, min(positions) - max(48, limit // 3))
        if start:
            boundary = content.find(" ", start)
            start = boundary + 1 if boundary >= 0 else start
        return self._truncate_excerpt(content, start, limit)

    @staticmethod
    def _truncate_excerpt(content: str, start: int, limit: int) -> str:
        end = min(len(content), start + limit)
        excerpt = content[start:end].strip()
        if start > 0:
            excerpt = f"…{excerpt}"
        return f"{excerpt}…" if end < len(content) else excerpt
