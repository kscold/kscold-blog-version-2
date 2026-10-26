import unittest
from unittest.mock import MagicMock

import grpc

from agent.grpc import vault_agent_pb2
from agent.server.grpc_servicer.vault_agent_servicer import VaultAgentServicer


class VaultChatTransportTest(unittest.TestCase):
    def setUp(self):
        self.servicer = VaultAgentServicer.__new__(VaultAgentServicer)
        self.servicer.application = MagicMock()
        self.context = MagicMock()
        self.context.is_active.return_value = True
        self.request = vault_agent_pb2.ChatRequest(message="질문")

    def test_closing_transport_closes_graph_and_preserves_scope(self):
        closed = []
        def events():
            try:
                yield "delta", "첫 답변"
                yield "delta", "다음 답변"
            finally:
                closed.append(True)
        self.servicer.application.stream_chat.return_value = events()
        self.request.content_access_scope.allowed_post_ids.append("granted-record")
        response = self.servicer.ChatStream(self.request, self.context)
        self.assertEqual(next(response).delta, "첫 답변")
        args = self.servicer.application.stream_chat.call_args.args
        self.assertIn("granted-record", args[2].allowed_post_ids)
        self.assertEqual(args[3].register_cancel, self.context.add_callback)
        response.close()
        self.assertEqual(closed, [True])

    def test_provider_error_is_not_exposed_in_grpc_status(self):
        def failed():
            raise RuntimeError("internal-provider-error")
            yield
        self.servicer.application.stream_chat.return_value = failed()
        list(self.servicer.ChatStream(self.request, self.context))
        self.context.abort.assert_called_once_with(grpc.StatusCode.UNAVAILABLE, "Agent 응답을 완료하지 못했습니다.")

    def test_cancelled_transport_drops_late_delta(self):
        self.servicer.application.stream_chat.return_value = (event for event in [("delta", "늦은 내용")])
        self.context.is_active.return_value = False
        self.assertEqual(list(self.servicer.ChatStream(self.request, self.context)), [])
        self.context.abort.assert_not_called()
