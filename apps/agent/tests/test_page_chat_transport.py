from types import SimpleNamespace
import unittest
from unittest.mock import MagicMock

import grpc

from agent.grpc import vault_agent_pb2
from agent.server.grpc_servicer.vault_agent_servicer import VaultAgentServicer
from agent.skills.page_chat.workflow import PageChatSkill


class FakeContext:
    def __init__(self):
        self.callbacks = []
        self.error = None

    def is_active(self):
        return True

    def add_callback(self, callback):
        self.callbacks.append(callback)
        return True

    def abort(self, code, message):
        self.error = (code, message)


class PageChatTransportTest(unittest.TestCase):
    def setUp(self):
        self.provider = MagicMock()
        self.stream = MagicMock()
        self.stream.__iter__.return_value = iter([SimpleNamespace(choices=[SimpleNamespace(delta=SimpleNamespace(content="팀 협업입니다.【S1】"))])])
        self.provider.with_options.return_value.chat.completions.create.return_value = self.stream
        self.servicer = VaultAgentServicer.__new__(VaultAgentServicer)
        self.application = MagicMock()
        self.application.page_chat = PageChatSkill("test-model", self.provider)
        self.servicer.application = self.application
        self.context = FakeContext()
        self.request = vault_agent_pb2.PageChatRequest(message="역할 질문", page_context=vault_agent_pb2.PageContext(
            title="작업 소개", path="/work-sample", sections=[vault_agent_pb2.PageSection(id="one", title="자료", content="팀 협업 설명")],
        ))

    def test_emits_sources_for_only_submitted_page_without_rag_or_database(self):
        events = list(self.servicer.PageChatStream(self.request, self.context))
        self.assertEqual([event.WhichOneof("event") for event in events], ["stage", "stage", "delta", "completed"])
        final = events[-1].completed
        self.assertEqual(final.answer, "팀 협업입니다.【S1】")
        self.assertEqual(final.sources[0].path, "/work-sample#one")
        self.assertEqual(final.sources[0].type, "page")
        self.assertEqual(final.sources[0].excerpt, "팀 협업 설명")
        self.assertEqual(len(final.stages), 2)
        self.application.chat.assert_not_called()
        self.application.stream_chat.assert_not_called()
        self.application.search_vault.assert_not_called()
        self.application.reindex.assert_not_called()
        self.application.source_excerpt.assert_not_called()
        self.assertIsNone(self.context.error)

    def test_page_request_cannot_contain_admin_or_private_access_scope(self):
        self.assertEqual(set(self.request.DESCRIPTOR.fields_by_name), {"message", "page_context", "conversation"})
        with self.assertRaises(ValueError):
            vault_agent_pb2.PageChatRequest(content_access_scope=vault_agent_pb2.ContentAccessScope(full_content_access=True))

    def test_invalid_page_does_not_invoke_provider(self):
        self.request.page_context.path = "https://other.test/private"
        list(self.servicer.PageChatStream(self.request, self.context))
        self.assertEqual(self.context.error[0], grpc.StatusCode.INVALID_ARGUMENT)
        self.provider.with_options.return_value.chat.completions.create.assert_not_called()

    def test_provider_errors_are_generic_at_grpc_boundary(self):
        private_error = "mock-provider-sensitive-value"
        self.provider.with_options.return_value.chat.completions.create.side_effect = RuntimeError(private_error)
        list(self.servicer.PageChatStream(self.request, self.context))
        self.assertEqual(self.context.error[0], grpc.StatusCode.UNAVAILABLE)
        self.assertNotIn(private_error, self.context.error[1])

    def test_general_agent_keeps_original_route_and_permission_contract(self):
        self.application.chat.return_value = {"answer": "일반 답변", "stages": [], "context": [], "follow_ups": []}
        request = vault_agent_pb2.ChatRequest(message="일반 질문", active_folder_name="전체", content_access_scope=vault_agent_pb2.ContentAccessScope(full_content_access=True))
        response = self.servicer.Chat(request, self.context)
        self.assertEqual(response.answer, "일반 답변")
        args = self.application.chat.call_args.args
        self.assertEqual(args[:2], ("일반 질문", "전체"))
        self.assertTrue(args[2].full_content_access)
        self.provider.with_options.return_value.chat.completions.create.assert_not_called()


if __name__ == "__main__":
    unittest.main()
