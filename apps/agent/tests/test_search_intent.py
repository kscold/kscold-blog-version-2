import unittest
from datetime import datetime
from types import SimpleNamespace
from unittest.mock import MagicMock

from qdrant_client import QdrantClient, models

from agent.graph.nodes.vault_rag_nodes import VaultRagNodes
from agent.graph.state.vault_chat_state import initial_state
from agent.tools.intent import query_intent
from agent.tools.models import ContentAccessScope, SearchOptions
from search_fixtures import Collection, make_store


class SourceIntentSearchTest(unittest.TestCase):
    def setUp(self):
        self.store = make_store()
        self.options = SearchOptions(limit=5)

    def test_최근_피드는_벡터_점수와_무관하게_공개_피드를_작성일순으로_찾는다(self):
        hits = self.store.search('최근 피드에서 눈여겨볼 만한 내용 알려줘', self.options)
        self.assertEqual([hit.note.id for hit in hits], ['feed-other', 'feed-new', 'feed-old'])
        self.store.qdrant.count.assert_not_called()

    def test_주제를_지정한_최근_피드는_관련_기록만_작성일순으로_찾는다(self):
        hits = self.store.search('요즘 피드에서 검색 관련 내용 알려줘', SearchOptions(limit=1))
        self.assertEqual([hit.note.id for hit in hits], ['feed-new'])

    def test_블로그_글_중_질문은_공개_발행글만_찾는다(self):
        hits = self.store.search('블로그 글 중 검색 관련 내용 알려줘', self.options)
        self.assertEqual([hit.note.id for hit in hits], ['post-1'])

    def test_Vault_노트_질문은_공개_노트만_찾는다(self):
        hits = self.store.search('Vault 노트 중 검색 관련 내용 알려줘', self.options)
        self.assertEqual([hit.note.id for hit in hits], ['vault-1'])

    def test_섞인_질문은_지정한_종류의_합집합을_유지한다(self):
        hits = self.store.search('피드와 블로그 글 중 검색 관련 내용 알려줘', self.options)
        self.assertEqual({hit.note.content_type for hit in hits}, {'feed', 'blog'})

    def test_섞인_최근_질문도_컬렉션을_합친_작성일순이다(self):
        hits = self.store.search('최근 피드와 블로그 글 알려줘', self.options)
        self.assertEqual([hit.note.id for hit in hits], ['feed-other', 'feed-new', 'post-1', 'feed-old'])

    def test_권한이_없는_피드만_있어도_다른_종류로_대신하지_않는다(self):
        self.store.feeds = Collection({'_id': 'private', 'visibility': 'PRIVATE', 'content': '검색'})
        self.assertEqual(self.store.search('최근 피드 알려줘', self.options), [])
        self.assertEqual(self.store.search('피드에서 검색 알려줘', self.options), [])

    def test_관리자와_글별_승인_권한을_기존대로_적용한다(self):
        full = SearchOptions(limit=10, scope=ContentAccessScope.full_access())
        self.assertEqual(self.store.search('최근 피드 알려줘', full)[0].note.id, 'feed-private')
        granted = SearchOptions(limit=10, scope=ContentAccessScope.from_values(allowed_post_ids=['post-private']))
        self.assertEqual([hit.note.id for hit in self.store.search('최근 블로그 글 알려줘', granted)], ['post-private', 'post-1'])

    def test_빈_피드_컬렉션과_명시적_도구_범위를_유지한다(self):
        self.store.feeds = Collection()
        self.assertEqual(self.store.search('최근 피드 알려줘', self.options), [])
        vault = SearchOptions(limit=5, content_types=frozenset({'vault'}))
        self.assertEqual(self.store.search('최근 피드 알려줘', vault), [])

    def test_소개_질문은_프로필만_반환한다(self):
        hits = self.store.search('소개 페이지 알려줘', self.options)
        self.assertEqual([hit.note.content_type for hit in hits], ['profile'])

    def test_Vault_폴더_선택이_명시한_피드_검색을_막지_않는다(self):
        self.store.folders = Collection({'_id': 'folder-1', 'name': '개발'})
        options = SearchOptions(limit=5, active_folder_name='개발')
        for question in ('최근 피드 알려줘', '피드에서 검색 알려줘'):
            hits = self.store.search(question, options)
            self.assertTrue(hits)
            self.assertEqual({hit.note.content_type for hit in hits}, {'feed'})

    def test_Vault_폴더_범위는_최근_조회에도_유지한다(self):
        self.store.folders = Collection({'_id': 'folder-1', 'name': '개발'})
        self.store.notes.documents[0]['folderId'] = 'folder-1'
        self.store.notes.documents.append({'_id': 'other-folder', 'title': '다른 폴더', 'createdAt': datetime(2026, 10, 27, 10)})
        options = SearchOptions(limit=5, active_folder_name='개발')
        self.assertEqual([hit.note.id for hit in self.store.search('최근 Vault 노트 알려줘', options)], ['vault-1'])

    def test_비슷한_단어를_출처로_오인하지_않는다(self):
        self.assertEqual(query_intent('피드백과 노트북 소개해줘').content_types, frozenset())

    def test_벡터_검색_전에_출처를_거르고_원본_권한도_재확인한다(self):
        client = QdrantClient(':memory:')
        self.addCleanup(client.close)
        client.create_collection('test-records', vectors_config=models.VectorParams(size=2, distance=models.Distance.COSINE))
        client.upsert('test-records', points=[
            models.PointStruct(id=index, vector=[1.0, 0.0], payload={'content_type': kind, 'document_id': doc_id})
            for index, (kind, doc_id) in enumerate([('blog', 'post-1'), ('feed', 'feed-private'), ('feed', 'feed-new')], start=1)
        ])
        self.store.qdrant = client
        self.store.embed_text = MagicMock(return_value=[1.0, 0.0])
        hits = self.store._vector_search('검색', 5, set(), ContentAccessScope(), frozenset({'feed'}))
        self.assertEqual([hit.note.id for hit in hits], ['feed-new'])

    def test_옛_Vault_색인도_출처_필터에서_유지한다(self):
        client = QdrantClient(':memory:')
        self.addCleanup(client.close)
        client.create_collection('test-records', vectors_config=models.VectorParams(size=2, distance=models.Distance.COSINE))
        client.upsert('test-records', points=[models.PointStruct(id=1, vector=[1.0, 0.0], payload={'note_id': 'vault-1'})])
        self.store.qdrant = client
        self.store.embed_text = MagicMock(return_value=[1.0, 0.0])
        hits = self.store._vector_search('검색', 5, set(), ContentAccessScope(), frozenset({'vault'}))
        self.assertEqual([hit.note.id for hit in hits], ['vault-1'])

    def test_그래프_확장과_웹_검색이_명시한_출처를_덮지_않는다(self):
        for question in ('최근 피드 알려줘', '블로그 글 중 검색 알려줘', 'Vault 노트 알려줘', '피드와 블로그 글 알려줘'):
            with self.subTest(question=question):
                self.store.expand_graph = MagicMock()
                web = MagicMock()
                nodes = VaultRagNodes(SimpleNamespace(max_context_notes=5, web_search_enabled=True), self.store, web)
                state = initial_state(question, '', None)
                nodes.retrieve(state)
                nodes.expand(state)
                nodes.search_web(state)
                self.store.expand_graph.assert_not_called()
                web.search.assert_not_called()
                self.assertEqual(state['context'], state['hits'])


if __name__ == '__main__':
    unittest.main()
