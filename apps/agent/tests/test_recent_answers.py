import unittest
from types import SimpleNamespace
from unittest.mock import MagicMock

from agent.graph.nodes.vault_rag_nodes import VaultRagNodes
from agent.graph.state.vault_chat_state import initial_state
from agent.tools.models import SearchOptions
from agent.tools.stream_control import StreamControl
from search_fixtures import make_store
from test_recent_queries import RECENT_FEED_QUESTIONS, production_shape_feeds


class RecentAnswerTest(unittest.TestCase):
    def setUp(self):
        self.store = make_store()
        self.store.openai.with_options.return_value = self.store.openai
        self.question = '최근 피드에 양자컴퓨팅 알려줘'
        self.hits = self.store.search(self.question, SearchOptions(limit=5))
        self.body = '전시 관람 기록이 올라왔습니다.【S1】'
        self.store.openai.chat.completions.create.return_value = SimpleNamespace(
            choices=[SimpleNamespace(message=SimpleNamespace(content=self.body))]
        )
        self.nodes = VaultRagNodes(SimpleNamespace(max_context_notes=5), self.store, MagicMock())

    def test_재현_질문과_대화체의_조회_단계가_0개로_표시되지_않는다(self):
        self.store.feeds = production_shape_feeds()
        for question in RECENT_FEED_QUESTIONS:
            with self.subTest(question=question):
                state = self.nodes.retrieve(initial_state(question, '', None))
                self.assertEqual(len(state['hits']), 5)
                self.assertIn('최근 작성된 기록 5개', state['stages'][-1]['detail'])

    def test_대체_조회는_단계와_프롬프트와_최종_답변에_사실을_알린다(self):
        state = self.nodes.retrieve(initial_state(self.question, '', None))
        self.assertIn('주제에 맞는 기록은 찾지 못했습니다', state['stages'][-1]['detail'])
        self.assertIn('3개', state['stages'][-1]['detail'])
        self.nodes.expand(state)
        self.nodes.answer(state)
        self.assertTrue(state['answer'].startswith('현재 열람 범위에서 요청한 주제에 맞는 기록은 찾지 못했습니다.'))
        self.assertIn('대신 같은 출처 범위의 최근 기록', state['answer'])
        self.assertTrue(state['answer'].endswith(self.body))
        messages = self.store.openai.chat.completions.create.call_args.kwargs['messages']
        self.assertIn('원래 주제와 일치하는 결과처럼 설명하지 않는다', messages[0]['content'])
        self.assertIn('주제에 맞는 기록은 찾지 못했습니다', messages[1]['content'])
        self.store.follow_ups, self.store.log_run = MagicMock(return_value=[]), MagicMock()
        self.nodes.complete(state)
        self.assertEqual([hit.note.id for hit in state['context']], ['feed-other'])
        self.assertIn('【S1】', state['answer'])

    def test_스트리밍도_대체_안내를_한번_보내고_실제_기록을_인용한다(self):
        response = self.stream_response(['전시 관람 기록', '입니다.【S1】'])
        chunks = list(self.store.answer_stream(self.question, '', self.hits))
        self.assertIn('주제에 맞는 기록은 찾지 못했습니다', chunks[0])
        self.assertEqual(chunks[1:], ['전시 관람 기록', '입니다.【S1】'])
        self.assertEqual(''.join(chunks).count('대신 같은 출처 범위'), 1)
        response.close.assert_called_once()

    def test_다음_일반_조회에_대체_표시가_섞이지_않는다(self):
        self.store.answer(self.question, '', self.hits)
        normal = self.store.search('최근 피드 알려줘', SearchOptions(limit=5))
        self.assertFalse(any(hit.topic_fallback for hit in normal))
        self.assertEqual(self.store.answer('최근 피드 알려줘', '', normal), self.body)
        self.assertTrue(all(hit.topic_fallback for hit in self.hits))

    def test_생성이_비었을_때_대체_안내만으로_성공한_답변을_만들지_않는다(self):
        self.store.openai.chat.completions.create.return_value.choices[0].message.content = ''
        self.assertEqual(self.store.answer(self.question, '', self.hits), '')
        response = self.stream_response([])
        self.assertEqual(list(self.store.answer_stream(self.question, '', self.hits)), [])
        response.close.assert_called_once()

    def test_대체_안내_후_취소해도_모델_스트림을_닫는다(self):
        response = self.stream_response([self.body])
        answer = self.store.answer_stream(self.question, '', self.hits)
        self.assertIn('대신', next(answer))
        answer.close()
        response.close.assert_called_once()

    def test_취소된_요청에는_대체_안내나_모델_요청을_보내지_않는다(self):
        answer = self.store.answer_stream(self.question, '', self.hits, control=StreamControl(lambda: False))
        self.assertEqual(list(answer), [])
        self.store.openai.with_options.assert_not_called()

    def stream_response(self, texts):
        response = MagicMock()
        response.__iter__.return_value = iter([
            SimpleNamespace(choices=[SimpleNamespace(delta=SimpleNamespace(content=text))])
            for text in texts
        ])
        self.store.openai.chat.completions.create.return_value = response
        return response


if __name__ == '__main__':
    unittest.main()
