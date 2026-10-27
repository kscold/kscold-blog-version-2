import json
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from threading import Thread
from types import SimpleNamespace
import unittest

from openai import OpenAI, RateLimitError

from agent.skills.page_chat.models import PageChatInput, PageSection
from agent.skills.page_chat.workflow import PageChatSkill
from agent.tools.store import VaultStore


class OpenAISdkContractTest(unittest.TestCase):
    """실제 SDK와 로컬 HTTP 응답으로 타임아웃 타입 및 SSE·JSON 계약을 검증합니다."""

    def setUp(self):
        self.state = SimpleNamespace(requests=[], status=200, content="근거 답변")
        state = self.state

        class Handler(BaseHTTPRequestHandler):
            def log_message(self, *_args):
                pass

            def do_POST(self):
                request = json.loads(self.rfile.read(int(self.headers["Content-Length"])))
                state.requests.append((self.path, request))
                content_type = "application/json"
                if state.status != 200:
                    payload = {"error": {"message": "test rate limit", "type": "rate_limit_error"}}
                    body = json.dumps(payload).encode()
                elif self.path == "/v1/embeddings":
                    body = json.dumps({"object": "list", "model": "test-embedding", "data": [
                        {"object": "embedding", "index": 0, "embedding": [0.1, 0.2]}
                    ], "usage": {"prompt_tokens": 1, "total_tokens": 1}}).encode()
                elif request.get("stream"):
                    content_type = "text/event-stream"
                    events = []
                    for text in ("근거 ", "답변"):
                        events.append("data: " + json.dumps({
                            "id": "test-chat", "object": "chat.completion.chunk", "created": 0,
                            "model": "test-model", "choices": [{"index": 0,
                                "delta": {"content": text}, "finish_reason": None}],
                        }, ensure_ascii=False) + "\n\n")
                    body = ("".join(events) + "data: [DONE]\n\n").encode()
                else:
                    body = json.dumps({"id": "test-chat", "object": "chat.completion",
                        "created": 0, "model": "test-model", "choices": [{"index": 0,
                            "message": {"role": "assistant", "content": state.content},
                            "finish_reason": "stop"}]}).encode()
                self.send_response(state.status)
                self.send_header("Content-Type", content_type)
                self.send_header("Content-Length", str(len(body)))
                self.end_headers()
                self.wfile.write(body)

        self.server = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
        self.thread = Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()
        self.client = OpenAI(api_key="test-only", base_url=f"http://127.0.0.1:{self.server.server_port}/v1")
        self.page = PageChatInput("역할은?", "작업", "/sample",
            (PageSection("source", "자료", "화면을 구현했다."),))

    def tearDown(self):
        self.client.close()
        self.server.shutdown()
        self.server.server_close()
        self.thread.join(timeout=2)

    def vault(self):
        store = VaultStore.__new__(VaultStore)
        store.openai = self.client
        store.config = SimpleNamespace(openai_chat_model="test-model", openai_embedding_model="test-embedding")
        return store

    def test_page_stream_preserves_unicode_and_no_store(self):
        events = list(PageChatSkill("test-model", self.client).stream(self.page, lambda: True))
        self.assertEqual([value for kind, value in events if kind == "delta"], ["근거 ", "답변"])
        self.assertEqual(events[-1][1]["answer"], "근거 답변")
        path, request = self.state.requests[0]
        self.assertEqual(path, "/v1/chat/completions")
        self.assertIs(request["store"], False)
        self.assertEqual(request["max_tokens"], 900)

    def test_page_provider_error_is_not_retried(self):
        self.state.status = 429
        with self.assertRaises(RateLimitError):
            list(PageChatSkill("test-model", self.client).stream(self.page, lambda: True))
        self.assertEqual(len(self.state.requests), 1)

    def test_cancellation_closes_the_real_sdk_stream(self):
        active = [True]
        streams = []

        def cancel(close):
            streams.append(close.__self__)
            active[0] = False
            close()
            return False

        events = list(PageChatSkill("test-model", self.client).stream(self.page, lambda: active[0], cancel))
        self.assertFalse(any(kind in {"delta", "completed"} for kind, _ in events))
        self.assertTrue(streams[0].response.is_closed)

    def test_vault_answer_and_followups_use_sdk_timeout(self):
        store = self.vault()
        self.assertEqual(store.answer("질문", "", []), "근거 답변")
        self.state.content = "- 질문 하나\n- 질문 둘"
        self.assertEqual(store.follow_ups("질문", "답변", []), ["질문 하나", "질문 둘"])

    def test_vault_stream_parses_real_sdk_chunks(self):
        self.assertEqual(list(self.vault().answer_stream("질문", "", [])), ["근거 ", "답변"])

    def test_embedding_json_preserves_vector_and_input_limit(self):
        self.assertEqual(self.vault().embed_text("가" * 8001), [0.1, 0.2])
        self.assertEqual(len(self.state.requests[0][1]["input"]), 8000)


if __name__ == "__main__":
    unittest.main()
