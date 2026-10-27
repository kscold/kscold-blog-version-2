import re
from types import SimpleNamespace
from unittest.mock import MagicMock

from agent.tools.store import VaultStore


def values_at(document, field):
    values = [document]
    for part in field.split('.'):
        values = [value.get(part) for value in values if isinstance(value, dict) and part in value]
        values = [item for value in values for item in (value if isinstance(value, list) else [value])]
    return values


def matches(document, query):
    for field, condition in query.items():
        if field == '$and':
            if not all(matches(document, part) for part in condition):
                return False
            continue
        if field == '$or':
            if not any(matches(document, part) for part in condition):
                return False
            continue
        values = values_at(document, field)
        if not isinstance(condition, dict):
            if condition not in values and not (condition is None and not values):
                return False
            continue
        for operator, expected in condition.items():
            if operator == '$exists' and bool(values) != expected:
                return False
            if operator == '$in' and not any(value in expected for value in values):
                return False
            if operator == '$nin' and any(value in expected for value in values):
                return False
            if operator == '$regex' and not any(re.search(expected, str(value), re.I) for value in values):
                return False
    return True


class Cursor:
    def __init__(self, documents):
        self.documents = list(documents)

    def sort(self, fields):
        for field, direction in reversed(fields):
            self.documents.sort(key=lambda doc: str(doc.get(field) or ''), reverse=direction < 0)
        return self

    def limit(self, limit):
        self.documents = self.documents[:limit]
        return self

    def __iter__(self):
        return iter(self.documents)


class Collection:
    def __init__(self, *documents):
        self.documents = list(documents)
        self.queries = []

    def find(self, query, _projection=None):
        self.queries.append(query)
        return Cursor(doc for doc in self.documents if matches(doc, query))

    def find_one(self, query, _projection=None):
        return next(iter(self.find(query)), None)


def make_store():
    # 실제 저장소 생성자는 연결과 색인 준비를 수행하므로 조회용 조합만 사용한다.
    store = VaultStore.__new__(VaultStore)
    store.config = SimpleNamespace(qdrant_collection='test-records', openai_chat_model='test')
    store.qdrant = MagicMock()
    store.qdrant.count.return_value = SimpleNamespace(count=0)
    store.openai = MagicMock()
    store.folders = Collection()
    store.categories = Collection({'_id': 'restricted', 'restricted': True})
    store.notes = Collection(
        {'_id': 'vault-1', 'title': '검색 노트', 'slug': 'search', 'content': '검색 노트와 벡터 색인', 'visibility': 'PUBLIC', 'createdAt': '2026-10-25T10:00:00Z'},
        {'_id': 'vault-private', 'title': '숨긴 노트', 'content': '검색 비공개', 'visibility': 'PRIVATE', 'createdAt': '2026-10-27T10:00:00Z'},
    )
    store.posts = Collection(
        {'_id': 'post-1', 'title': '검색 블로그', 'slug': 'search', 'content': '검색 범위 확인', 'status': 'PUBLISHED', 'createdAt': '2026-10-24T10:00:00Z'},
        {'_id': 'post-private', 'title': '제한된 블로그', 'content': '검색 권한', 'status': 'PUBLISHED', 'category': {'id': 'restricted'}, 'createdAt': '2026-10-27T10:00:00Z'},
        {'_id': 'post-draft', 'title': '미발행 글', 'content': '검색 초안', 'status': 'DRAFT', 'createdAt': '2026-10-28T10:00:00Z'},
    )
    store.feeds = Collection(
        {'_id': 'feed-old', 'content': '검색 범위 예전 기록', 'visibility': 'PUBLIC', 'createdAt': '2025-01-01T10:00:00Z'},
        {'_id': 'feed-new', 'content': '검색 범위 최신 확인. 공개 기록만 찾았다.', 'visibility': 'PUBLIC', 'createdAt': '2026-10-26T10:00:00Z'},
        {'_id': 'feed-private', 'content': '검색 비공개 피드', 'visibility': 'PRIVATE', 'createdAt': '2026-10-27T10:00:00Z'},
        {'_id': 'feed-other', 'content': '전시 관람 메모', 'visibility': 'PUBLIC', 'createdAt': '2026-10-26T11:00:00Z'},
    )
    return store
