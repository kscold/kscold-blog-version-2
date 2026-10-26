from types import SimpleNamespace
import unittest
from unittest.mock import MagicMock

from agent.graph.workflow.vault_rag_workflow import VaultRagGraph
from agent.tools.answering import VaultAnsweringMixin
from agent.tools.stream_control import StreamControl


def chunk(text):
    return SimpleNamespace(choices=[SimpleNamespace(delta=SimpleNamespace(content=text))])


class VaultAnswerStreamTest(unittest.TestCase):
    def setUp(self):
        self.store = VaultAnsweringMixin()
        self.store.config = SimpleNamespace(openai_chat_model="test-model")
        self.store.openai = MagicMock()
        self.store.openai.with_options.return_value = self.store.openai
        self.response = MagicMock()
        self.response.__iter__.return_value = iter([chunk("첫 답변"), chunk("다음 답변")])
        self.store.openai.chat.completions.create.return_value = self.response

    def test_normal_completion_closes_provider(self):
        self.assertEqual(list(self.store.answer_stream("질문", "", [])), ["첫 답변", "다음 답변"])
        self.response.close.assert_called_once()
        self.store.openai.with_options.assert_called_once_with(max_retries=0)
        options = self.store.openai.chat.completions.create.call_args.kwargs
        self.assertEqual(options["timeout"].connect, 5)
        self.assertEqual(options["timeout"].read, 20)

    def test_consumer_close_releases_provider_without_next_chunk(self):
        answer = self.store.answer_stream("질문", "", [])
        self.assertEqual(next(answer), "첫 답변")
        answer.close()
        self.response.close.assert_called_once()

    def test_cancel_before_generation_does_not_open_provider(self):
        self.assertEqual(list(self.store.answer_stream("질문", "", [], control=StreamControl(lambda: False))), [])
        self.store.openai.chat.completions.create.assert_not_called()

    def test_cancel_during_connection_closes_without_publishing_text(self):
        register = MagicMock(return_value=False)
        self.assertEqual(list(self.store.answer_stream("질문", "", [], control=StreamControl(register_cancel=register))), [])
        register.assert_called_once_with(self.response.close)
        self.response.close.assert_called_once()

    def test_read_failure_still_closes_provider(self):
        def broken():
            yield chunk("받은 내용")
            raise RuntimeError("읽기 오류")
        self.response.__iter__.side_effect = broken
        with self.assertRaises(RuntimeError):
            list(self.store.answer_stream("질문", "", []))
        self.response.close.assert_called_once()


class VaultGraphStreamTest(unittest.TestCase):
    def setUp(self):
        self.graph = VaultRagGraph.__new__(VaultRagGraph)
        self.graph.nodes = MagicMock()
        self.graph.store = MagicMock()

    def test_cancelled_request_does_not_search_or_log_completed_answer(self):
        events = list(self.graph.stream_chat("질문", "", control=StreamControl(lambda: False)))
        self.assertEqual(events, [])
        self.graph.nodes.retrieve.assert_not_called()
        self.graph.nodes.complete.assert_not_called()

    def test_cancellation_after_search_does_not_start_next_tool(self):
        active = [True]
        self.graph.nodes.retrieve.side_effect = lambda state: active.__setitem__(0, False)
        list(self.graph.stream_chat("질문", "", control=StreamControl(lambda: active[0])))
        self.graph.nodes.expand.assert_not_called()
        self.graph.store.answer_stream.assert_not_called()

    def test_empty_answer_does_not_generate_followups_or_success(self):
        self.graph.store.answer_stream.return_value = (text for text in [])
        with self.assertRaisesRegex(RuntimeError, "비어"):
            list(self.graph.stream_chat("질문", ""))
        self.graph.nodes.complete.assert_not_called()

    def test_consumer_close_closes_nested_answer_generator(self):
        closed = []
        def answer():
            try:
                yield "처음"
                yield "다음"
            finally:
                closed.append(True)
        self.graph.store.answer_stream.return_value = answer()
        events = self.graph.stream_chat("질문", "")
        while next(events)[0] != "delta":
            pass
        events.close()
        self.assertEqual(closed, [True])
        self.graph.nodes.complete.assert_not_called()


if __name__ == "__main__":
    unittest.main()
