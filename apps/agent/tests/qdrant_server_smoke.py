"""일회용 CI Qdrant 서버에서 실제 벡터 검색·권한 필터 계약을 검사합니다."""

import os
import time
import unittest
from uuid import uuid4

from qdrant_client import QdrantClient, models

from agent.tools.models import ContentAccessScope
from test_qdrant_sdk_contract import VectorSearchHarness


class QdrantServerContractTest(unittest.TestCase):
    def test_remote_query_preserves_payload_and_document_access(self):
        # 운영 주소나 기본값으로 연결하지 않습니다.
        url = os.environ["QDRANT_TEST_URL"]
        self.assertEqual(url, "http://127.0.0.1:16333")
        with QdrantClient(url=url, timeout=5) as client:
            for attempt in range(30):
                try:
                    client.get_collections()
                    break
                except Exception:
                    if attempt == 29:
                        raise
                    time.sleep(1)
            collection = "upgrade_contract_" + uuid4().hex
            client.create_collection(collection, vectors_config=models.VectorParams(size=2, distance=models.Distance.COSINE))
            try:
                client.upsert(collection, wait=True, points=[
                    models.PointStruct(id=index, vector=[1.0, 0.0], payload={
                        "content_type": "vault", "document_id": identifier,
                    })
                    for index, identifier in enumerate(["public", "private-or-deleted"], start=1)
                ])
                store = VectorSearchHarness(client)
                store.config.qdrant_collection = collection
                hits = store._vector_search("질문", 5, {"folder-a"}, ContentAccessScope(), frozenset({"vault"}))
                self.assertEqual([hit.note.id for hit in hits], ["public"])
            finally:
                client.delete_collection(collection)


if __name__ == "__main__":
    unittest.main(verbosity=2)
