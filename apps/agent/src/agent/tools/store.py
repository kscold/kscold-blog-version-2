from __future__ import annotations

from openai import OpenAI
from pymongo import MongoClient
from qdrant_client import QdrantClient
from qdrant_client.http.models import Distance, VectorParams

from agent.config import AgentConfig
from agent.tools.access import VaultAccessMixin
from agent.tools.answering import VaultAnsweringMixin
from agent.tools.catalog import VaultCatalogMixin
from agent.tools.indexing import VaultIndexingMixin
from agent.tools.mappers import VaultDocumentMapperMixin
from agent.tools.models import ContentAccessScope, SearchHit, VaultNote
from agent.tools.observability import VaultObservabilityMixin
from agent.tools.query import VaultQueryMixin
from agent.tools.ranking import VaultRankingMixin
from agent.tools.search import VaultSearchMixin


class VaultStore(
    VaultAccessMixin,
    VaultCatalogMixin,
    VaultDocumentMapperMixin,
    VaultSearchMixin,
    VaultRankingMixin,
    VaultIndexingMixin,
    VaultAnsweringMixin,
    VaultObservabilityMixin,
    VaultQueryMixin,
):
    """Agent 도구가 공유하는 MongoDB·Qdrant·OpenAI 연결을 제공하는 조합 계층입니다.

    이 클래스에는 인프라 연결과 컬렉션 준비만 둡니다. 검색·권한·색인·답변 규칙은
    각 mixin으로 분리해 한 파일이 모든 Agent 로직을 알지 않도록 유지합니다.
    """

    def __init__(self, config: AgentConfig):
        if not config.openai_api_key:
            raise RuntimeError("OPENAI_API_KEY is required")

        self.config = config
        self.openai = OpenAI(api_key=config.openai_api_key)
        self.mongo = MongoClient(config.mongodb_uri)
        self.db = self.mongo[config.mongodb_database]
        self.notes = self.db["vault_notes"]
        self.folders = self.db["vault_folders"]
        self.posts = self.db["posts"]
        self.categories = self.db["categories"]
        self.feeds = self.db["feeds"]
        self.runs = self.db["vault_agent_runs"]
        self.qdrant = QdrantClient(url=config.qdrant_url)
        self._ensure_collection()

    def _ensure_collection(self) -> None:
        collections = {collection.name for collection in self.qdrant.get_collections().collections}
        if self.config.qdrant_collection in collections:
            return
        vector_size = len(self.embed_text("dimension probe"))
        self.qdrant.create_collection(
            collection_name=self.config.qdrant_collection,
            vectors_config=VectorParams(size=vector_size, distance=Distance.COSINE),
        )

    def embed_text(self, text: str) -> list[float]:
        response = self.openai.embeddings.create(
            model=self.config.openai_embedding_model,
            input=text[:8000],
        )
        return response.data[0].embedding


__all__ = ["ContentAccessScope", "SearchHit", "VaultNote", "VaultStore"]
