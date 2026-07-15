from dataclasses import dataclass
import os


@dataclass(frozen=True)
class AgentConfig:
    openai_api_key: str
    openai_chat_model: str
    openai_embedding_model: str
    mongodb_uri: str
    mongodb_database: str
    qdrant_url: str
    qdrant_collection: str
    grpc_port: int
    max_context_notes: int
    web_search_enabled: bool
    web_search_model: str
    index_sync_interval_seconds: int


def load_config() -> AgentConfig:
    return AgentConfig(
        openai_api_key=os.getenv("OPENAI_API_KEY", ""),
        openai_chat_model=os.getenv("OPENAI_CHAT_MODEL", "gpt-4o-mini"),
        openai_embedding_model=os.getenv("OPENAI_EMBEDDING_MODEL", "text-embedding-3-small"),
        mongodb_uri=os.getenv("MONGODB_URI", "mongodb://localhost:27017/kscold-blog"),
        mongodb_database=os.getenv("MONGODB_DATABASE", "kscold-blog"),
        qdrant_url=os.getenv("QDRANT_URL", "http://localhost:6333"),
        qdrant_collection=os.getenv("QDRANT_COLLECTION", "vault_notes"),
        grpc_port=int(os.getenv("VAULT_AGENT_GRPC_PORT", "9090")),
        max_context_notes=int(os.getenv("VAULT_AGENT_MAX_CONTEXT_NOTES", "5")),
        web_search_enabled=os.getenv("VAULT_AGENT_WEB_SEARCH_ENABLED", "true").lower() == "true",
        web_search_model=os.getenv("OPENAI_WEB_SEARCH_MODEL", "gpt-5-search-api"),
        index_sync_interval_seconds=int(
            os.getenv("VAULT_AGENT_INDEX_SYNC_INTERVAL_SECONDS", "900")
        ),
    )
