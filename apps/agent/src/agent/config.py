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


def _read_positive_int(name: str, default: int) -> int:
    raw_value = os.getenv(name)
    if raw_value is None:
        return default

    try:
        value = int(raw_value)
    except ValueError:
        raise ValueError(f"{name}은 정수여야 합니다.") from None

    if value <= 0:
        raise ValueError(f"{name}은 0보다 커야 합니다.")
    return value


def _read_port(name: str, default: int) -> int:
    port = _read_positive_int(name, default)
    if port > 65_535:
        raise ValueError(f"{name}은 65535 이하여야 합니다.")
    return port


def _read_bool(name: str, default: bool) -> bool:
    raw_value = os.getenv(name)
    if raw_value is None:
        return default

    normalized_value = raw_value.strip().lower()
    if normalized_value in {"true", "1", "yes", "on"}:
        return True
    if normalized_value in {"false", "0", "no", "off"}:
        return False
    raise ValueError(f"{name}은 true 또는 false 형식이어야 합니다.")


def load_config() -> AgentConfig:
    return AgentConfig(
        openai_api_key=os.getenv("OPENAI_API_KEY", ""),
        openai_chat_model=os.getenv("OPENAI_CHAT_MODEL", "gpt-4o-mini"),
        openai_embedding_model=os.getenv("OPENAI_EMBEDDING_MODEL", "text-embedding-3-small"),
        mongodb_uri=os.getenv("MONGODB_URI", "mongodb://localhost:27017/kscold-blog"),
        mongodb_database=os.getenv("MONGODB_DATABASE", "kscold-blog"),
        qdrant_url=os.getenv("QDRANT_URL", "http://localhost:6333"),
        qdrant_collection=os.getenv("QDRANT_COLLECTION", "vault_notes"),
        grpc_port=_read_port("VAULT_AGENT_GRPC_PORT", 9090),
        max_context_notes=_read_positive_int("VAULT_AGENT_MAX_CONTEXT_NOTES", 5),
        web_search_enabled=_read_bool("VAULT_AGENT_WEB_SEARCH_ENABLED", True),
        web_search_model=os.getenv("OPENAI_WEB_SEARCH_MODEL", "gpt-5-search-api"),
        index_sync_interval_seconds=_read_positive_int(
            "VAULT_AGENT_INDEX_SYNC_INTERVAL_SECONDS", 900
        ),
    )
