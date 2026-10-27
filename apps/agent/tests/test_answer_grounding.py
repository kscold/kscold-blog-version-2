import json
import unittest
from types import SimpleNamespace
from unittest.mock import MagicMock

from agent.graph.nodes.vault_rag_nodes import VaultRagNodes
from agent.graph.state.vault_chat_state import initial_state
from agent.prompts.vault_chat import answer_messages, follow_up_messages
from agent.tools.citations import cited_records
from agent.tools.models import ContentAccessScope, SearchOptions
from search_fixtures import make_store


class AnswerGroundingTest(unittest.TestCase):
    def setUp(self):
        self.store = make_store()
        self.hits = self.store.search('최근 피드 알려줘', SearchOptions(limit=5))

    def test_답변에_인용한_기록만_남기고_번호를_맞춘다(self):
        answer, sources = cited_records('검색 범위를 확인했다.【S2】 없는 출처【S99】', self.hits)
        self.assertEqual([hit.note.id for hit in sources], ['feed-new'])
        self.assertEqual(answer, '검색 범위를 확인했다.【S1】 없는 출처')

    def test_인용_없는_답변에는_참고_카드를_만들지_않는다(self):
        self.assertEqual(cited_records('관련 기록이 없습니다.', self.hits)[1], [])

    def test_사용한_출처만_후속질문과_실행기록에_전달한다(self):
        state = initial_state('최근 피드 알려줘', '', None)
        state['context'], state['answer'] = self.hits, '검색 범위를 확인했다.【S2】'
        self.store.follow_ups, self.store.log_run = MagicMock(return_value=[]), MagicMock()
        nodes = VaultRagNodes(SimpleNamespace(), self.store, MagicMock())
        nodes.complete(state)
        self.assertEqual(state['answer'], '검색 범위를 확인했다.【S1】')
        self.assertEqual([hit.note.id for hit in self.store.follow_ups.call_args.args[2]], ['feed-new'])
        self.assertEqual(self.store.log_run.call_args.args[2], state['context'])

    def test_결과가_없으면_생성기_호출없이_열람범위_한계를_알린다(self):
        for question in ('최근 피드 알려줘', '블로그 글 중 검색 알려줘', 'Vault 노트 알려줘'):
            with self.subTest(question=question):
                response = self.store.answer(question, '', [])
                self.assertIn('현재 열람 범위', response)
                self.assertEqual(list(self.store.answer_stream(question, '', [])), [response])
        self.store.openai.with_options.assert_not_called()

    def test_후속질문은_실제_출처와_본문_주제로만_제한한다(self):
        raw = json.dumps([
            {'source': 2, 'topic': '검색 범위', 'question': '검색 범위는 어떻게 확인했어?'},
            {'source': 1, 'topic': 'MongoDB 8.0', 'question': 'MongoDB 8.0의 주요 기능은?'},
            {'source': 2, 'topic': '검색 범위', 'question': '검색 범위와 MongoDB 8.0은 어떤 관계야?'},
            {'source': 99, 'topic': '검색 범위', 'question': '검색 범위는 무엇이야?'},
        ])
        self.assertEqual(self.store._grounded_follow_ups(raw, self.hits), ['검색 범위는 어떻게 확인했어?'])

    def test_비어있거나_잘못된_후속질문은_보여주지_않는다(self):
        self.assertEqual(self.store.follow_ups('질문', '답변', []), [])
        for raw in ('질문 세 개', '{}', '[null, 2]', '[{"source":true}]'):
            self.assertEqual(self.store._grounded_follow_ups(raw, self.hits), [])
        self.store.openai.with_options.assert_not_called()

    def test_프롬프트에_작성일과_실제_본문을_전달한다(self):
        messages = answer_messages('최근 피드 알려줘', '', self.hits, [], ContentAccessScope())
        self.assertIn('2026-10-26', messages[1]['content'])
        self.assertIn('일부 종류가 빠져 있으면', messages[0]['content'])
        followups = follow_up_messages('최근 피드 알려줘', '답변', self.hits)
        self.assertIn('공개 기록만 찾았다', followups[1]['content'])


if __name__ == '__main__':
    unittest.main()
