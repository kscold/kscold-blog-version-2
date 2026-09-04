import os
import unittest
from unittest.mock import patch

from agent.config import AgentConfig, load_config


class LoadConfigTest(unittest.TestCase):
    def test_환경_변수가_없으면_안전한_기본값을_사용한다(self) -> None:
        with patch.dict(os.environ, {}, clear=True):
            config = load_config()

        self.assertEqual(
            config,
            AgentConfig(
                openai_api_key="",
                openai_chat_model="gpt-4o-mini",
                openai_embedding_model="text-embedding-3-small",
                mongodb_uri="mongodb://localhost:27017/kscold-blog",
                mongodb_database="kscold-blog",
                qdrant_url="http://localhost:6333",
                qdrant_collection="vault_notes",
                grpc_port=9090,
                max_context_notes=5,
                web_search_enabled=True,
                web_search_model="gpt-5-search-api",
                index_sync_interval_seconds=900,
            ),
        )

    def test_불리언_false_별칭을_해석한다(self) -> None:
        with patch.dict(
            os.environ, {"VAULT_AGENT_WEB_SEARCH_ENABLED": "off"}, clear=True
        ):
            config = load_config()

        self.assertFalse(config.web_search_enabled)

    def test_잘못된_불리언은_거부한다(self) -> None:
        with patch.dict(
            os.environ, {"VAULT_AGENT_WEB_SEARCH_ENABLED": "enabled"}, clear=True
        ):
            with self.assertRaisesRegex(ValueError, "VAULT_AGENT_WEB_SEARCH_ENABLED"):
                load_config()

    def test_정수가_아닌_포트는_거부한다(self) -> None:
        with patch.dict(os.environ, {"VAULT_AGENT_GRPC_PORT": "grpc"}, clear=True):
            with self.assertRaisesRegex(ValueError, "VAULT_AGENT_GRPC_PORT"):
                load_config()

    def test_범위를_벗어난_포트는_거부한다(self) -> None:
        with patch.dict(os.environ, {"VAULT_AGENT_GRPC_PORT": "65536"}, clear=True):
            with self.assertRaisesRegex(ValueError, "65535"):
                load_config()

    def test_0인_검색_문서_수는_거부한다(self) -> None:
        with patch.dict(
            os.environ, {"VAULT_AGENT_MAX_CONTEXT_NOTES": "0"}, clear=True
        ):
            with self.assertRaisesRegex(ValueError, "VAULT_AGENT_MAX_CONTEXT_NOTES"):
                load_config()

    def test_음수인_색인_주기는_거부한다(self) -> None:
        with patch.dict(
            os.environ,
            {"VAULT_AGENT_INDEX_SYNC_INTERVAL_SECONDS": "-1"},
            clear=True,
        ):
            with self.assertRaisesRegex(
                ValueError, "VAULT_AGENT_INDEX_SYNC_INTERVAL_SECONDS"
            ):
                load_config()


if __name__ == "__main__":
    unittest.main()
