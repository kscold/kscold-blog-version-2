import unittest
from datetime import datetime, timedelta

from bson import BSON, ObjectId

from agent.tools.intent import query_intent
from agent.tools.models import ContentAccessScope, SearchOptions
from search_fixtures import Collection, make_store


RECENT_FEED_QUESTIONS = (
    '최근 피드 뭐 올라왔어?',
    '요즘 피드에 뭐 썼어?',
    '최근에 올린 피드 보여줘',
    '최근 피드 알려줘',
    '최근 피드',
    '피드 최신 글',
    '최근 피드에 뭐 올라왔어?',
    '최근 피드는 뭐 올라왔어?',
    '요즘 피드에서 뭐가 올라왔나요?',
    '최근에 올라온 피드 보여줘',
    '피드에 최근 뭐 올렸어?',
    '요즘 피드에 쓴 글 있어?',
    '최근 작성한 피드 알려줘',
    '최근 피드에 무엇을 작성했어?',
    '요즘 피드에서 뭐 했어?',
    '최근 피드 뭐가 됐어?',
    '요즘 피드엔 뭐 있어?',
    '최근 피드에 새 글 있나요?',
    '최근 피드에 올린 거 좀 보여줘',
    '최근 피드에서 작성된 내용 정리해줘',
    '최신 피드 뭐 있나?',
    '요즘 피드에는 어떤 글이 있어요?',
)


def production_shape_feeds():
    # 운영과 같은 PUBLIC·BSON date 구조이며, 본문은 테스트 전용 가상 자료다.
    return Collection(*(BSON.encode({
        '_id': ObjectId(f'{index + 1:024x}'),
        'content': f'검증용 전시 관람 기록 {index}',
        'visibility': 'PUBLIC',
        'tags': ['전시'],
        'linkPreview': None,
        'createdAt': datetime(2026, 9, 20, 12) - timedelta(days=index),
    }).decode() for index in range(54)))


class RecentConversationTest(unittest.TestCase):
    def setUp(self):
        self.store = make_store()
        self.options = SearchOptions(limit=5)

    def test_운영_형태_54개_피드에서_대화체_22문장이_같은_최신_기록을_찾는다(self):
        self.store.feeds = production_shape_feeds()
        expected = [str(document['_id']) for document in self.store.feeds.documents[:5]]
        for question in RECENT_FEED_QUESTIONS:
            with self.subTest(question=question):
                self.store.feeds.queries.clear()
                intent = query_intent(question)
                self.assertEqual(intent.content_types, frozenset({'feed'}))
                self.assertTrue(intent.recent)
                self.assertEqual(intent.topic, '')
                hits = self.store.search(question, self.options)
                self.assertEqual([hit.note.id for hit in hits], expected)
                self.assertEqual(hits[0].note.created_at, '2026-09-20T12:00:00+00:00')
                self.assertFalse(any(hit.topic_fallback for hit in hits))
                self.assertEqual(len(self.store.feeds.queries), 1)
        self.assertIsInstance(self.store.feeds.documents[0]['createdAt'], datetime)
        self.store.openai.with_options.assert_not_called()
        self.store.qdrant.count.assert_not_called()

    def test_출처_네_종류의_조사를_같은_규칙으로_읽고_주제에서_제거한다(self):
        for source, kind in [('피드', 'feed'), ('블로그', 'blog'), ('Vault', 'vault'), ('소개', 'profile')]:
            for particle in ('에', '는', '에서', '에는', '에서는', '도', '만'):
                with self.subTest(source=source, particle=particle):
                    intent = query_intent(f'{source}{particle} 있는 내용 알려줘')
                    self.assertEqual(intent.content_types, frozenset({kind}))
                    self.assertEqual(intent.topic, '')
                    hits = self.store.search(f'{source}{particle} 있는 내용 알려줘', self.options)
                    self.assertTrue(hits)
                    self.assertEqual({hit.note.content_type for hit in hits}, {kind})

    def test_동사와_비슷한_주제나_출처와_비슷한_단어는_지우지_않는다(self):
        for topic in ('이벤트', '작성법', '올린더', '있는그대로', '피드백', '노트북', '소개팅'):
            with self.subTest(topic=topic):
                intent = query_intent(f'최근 피드에 {topic} 관련해서 뭐 썼어?')
                self.assertEqual(intent.topic, topic)
                self.assertEqual(intent.content_types, frozenset({'feed'}))

    def test_실제_주제에_맞는_결과가_있으면_최신_전체_조회로_넓히지_않는다(self):
        hits = self.store.search('요즘 피드에 검색 관련해서 뭐 썼어?', SearchOptions(limit=1))
        self.assertEqual([hit.note.id for hit in hits], ['feed-new'])
        self.assertFalse(hits[0].topic_fallback)
        self.assertEqual(len(self.store.feeds.queries), 1)

    def test_주제가_없거나_모르는_말투면_같은_출처_최신_조회는_한번뿐이다(self):
        for topic in ('양자컴퓨팅', '주절주절뭐썼을까요'):
            with self.subTest(topic=topic):
                self.store.feeds.queries.clear()
                hits = self.store.search(f'최근 피드에 {topic} 알려줘', self.options)
                self.assertEqual([hit.note.id for hit in hits], ['feed-other', 'feed-new', 'feed-old'])
                self.assertTrue(all(hit.topic_fallback for hit in hits))
                self.assertEqual(len(self.store.feeds.queries), 2)
                self.assertIn('$regex', str(self.store.feeds.queries[0]))
                self.assertNotIn('$regex', str(self.store.feeds.queries[1]))
        self.assertFalse(self.store.posts.queries)
        self.assertFalse(self.store.notes.queries)
        self.store.openai.with_options.assert_not_called()

    def test_대체_조회에도_열람_권한과_결과_개수를_유지한다(self):
        question = '최근 피드에 양자컴퓨팅 알려줘'
        public = self.store.search(question, SearchOptions(limit=1))
        full = self.store.search(question, SearchOptions(limit=1, scope=ContentAccessScope.full_access()))
        self.assertEqual([hit.note.id for hit in public], ['feed-other'])
        self.assertEqual([hit.note.id for hit in full], ['feed-private'])

    def test_대체_조회에도_선택한_Vault_폴더와_도구_범위를_유지한다(self):
        self.store.folders = Collection({'_id': 'folder-1', 'name': '개발'})
        self.store.notes.documents[0]['folderId'] = 'folder-1'
        self.store.notes.documents.append({'_id': 'outside', 'title': '다른 폴더', 'createdAt': datetime(2026, 10, 28)})
        options = SearchOptions(limit=5, active_folder_name='개발', content_types=frozenset({'vault'}))
        hits = self.store.search('최근 Vault에 양자컴퓨팅 알려줘', options)
        self.assertEqual([hit.note.id for hit in hits], ['vault-1'])
        self.assertTrue(hits[0].topic_fallback)
        self.assertEqual(self.store.search('최근 피드에 양자컴퓨팅 알려줘', options), [])

    def test_비공개_피드만_있거나_컬렉션이_비어도_출처를_바꾸지_않는다(self):
        for documents in ([], [self.store.feeds.documents[2]]):
            with self.subTest(count=len(documents)):
                self.store.feeds = Collection(*documents)
                self.assertEqual(self.store.search('최근 피드에 양자컴퓨팅 알려줘', self.options), [])
                self.assertEqual(len(self.store.feeds.queries), 2)
        self.assertFalse(self.store.posts.queries)
        self.assertFalse(self.store.notes.queries)

    def test_최근순이_아닌_주제_검색에는_대체_최신_기록을_넣지_않는다(self):
        self.assertEqual(self.store.search('피드에 양자컴퓨팅 알려줘', self.options), [])

    def test_섞인_출처의_대체_조회도_합쳐서_작성일순으로_정렬한다(self):
        hits = self.store.search('최근 피드와 블로그에 양자컴퓨팅 알려줘', self.options)
        self.assertEqual([hit.note.id for hit in hits], ['feed-other', 'feed-new', 'post-1', 'feed-old'])
        self.assertTrue(all(hit.topic_fallback for hit in hits))
        self.assertEqual(len(self.store.feeds.queries), 2)
        self.assertEqual(len(self.store.posts.queries), 2)
        self.assertFalse(self.store.notes.queries)

    def test_모르는_대화체도_BSON_날짜_피드에서_최신순_대체_결과를_받는다(self):
        self.store.feeds = production_shape_feeds()
        hits = self.store.search('요즘 피드에 주절주절뭐썼을까요?', self.options)
        self.assertEqual(len(hits), 5)
        self.assertEqual(hits[0].note.created_at, '2026-09-20T12:00:00+00:00')
        self.assertTrue(all(hit.topic_fallback for hit in hits))
        self.assertEqual(len(self.store.feeds.queries), 2)


if __name__ == '__main__':
    unittest.main()
