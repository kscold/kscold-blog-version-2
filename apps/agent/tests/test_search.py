import unittest

from agent.tools.models import ContentAccessScope, VaultNote
from agent.tools.query import VaultQueryMixin
from agent.tools.ranking import VaultRankingMixin
from agent.tools.search import VaultSearchMixin


class EmptyCursor:
    def limit(self, _limit: int) -> "EmptyCursor":
        return self

    def __iter__(self):
        return iter(())


class EmptyCollection:
    def find(self, _query: dict) -> EmptyCursor:
        return EmptyCursor()


class SearchHarness(VaultSearchMixin, VaultRankingMixin, VaultQueryMixin):
    def __init__(self) -> None:
        self.notes = EmptyCollection()
        self.blog_candidate_requests = 0

    @staticmethod
    def _vault_access_filter(_scope: ContentAccessScope) -> dict:
        return {}

    def _post_candidates(
        self, _conditions: list[dict], _scope: ContentAccessScope, limit: int = 120
    ) -> list[VaultNote]:
        self.blog_candidate_requests += 1
        return [
            VaultNote(
                id="blog-1",
                title="Spring Boot 운영 기록",
                slug="spring-boot-operations",
                content="Spring Boot 서버 운영 경험",
                folder_id=None,
                outgoing_links=[],
                tags=["Spring Boot"],
                content_type="blog",
                path="/blog/backend/spring-boot-operations",
            )
        ][:limit]

    @staticmethod
    def _feed_candidates(
        _conditions: list[dict], _scope: ContentAccessScope, limit: int = 120
    ) -> list[VaultNote]:
        return []

    @staticmethod
    def _folder_names(_folder_id: object) -> list[str]:
        return []


class ContentTypeSearchTest(unittest.TestCase):
    def test_블로그_전용_검색은_블로그_후보를_조회한다(self) -> None:
        store = SearchHarness()

        hits = store.keyword_search(
            "Spring Boot",
            limit=5,
            content_types=frozenset({"blog"}),
        )

        self.assertEqual([hit.note.content_type for hit in hits], ["blog"])

    def test_vault_전용_검색은_블로그_후보를_조회하지_않는다(self) -> None:
        store = SearchHarness()

        store.keyword_search(
            "Spring Boot",
            limit=5,
            content_types=frozenset({"vault"}),
        )

        self.assertEqual(store.blog_candidate_requests, 0)


if __name__ == "__main__":
    unittest.main()
