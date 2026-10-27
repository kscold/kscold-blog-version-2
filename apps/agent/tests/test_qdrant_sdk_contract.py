from types import SimpleNamespace
import unittest

from qdrant_client import QdrantClient, models

from agent.tools.models import ContentAccessScope, VaultNote
from agent.tools.search import VaultSearchMixin


def note(identifier, content_type="vault", folder_id="folder-a"):
    return VaultNote(id=identifier, title=identifier, slug=identifier, content="검색 자료",
        folder_id=folder_id, outgoing_links=[], tags=[], content_type=content_type, path="/sample")


class VectorSearchHarness(VaultSearchMixin):
    def __init__(self, client):
        self.qdrant = client
        self.config = SimpleNamespace(qdrant_collection="contract")
        self.documents = {"vault:public": note("public"), "vault:other-folder": note("other-folder", folder_id="folder-b"),
            "blog:post": note("post", content_type="blog", folder_id=None)}

    def embed_text(self, _query):
        return [1.0, 0.0]

    def _fetch_index_documents(self, references, scope):
        self.requested_scope = scope
        self.references = references
        return {f"{kind}:{identifier}": self.documents[f"{kind}:{identifier}"]
            for kind, identifier in references if f"{kind}:{identifier}" in self.documents}


class QdrantSdkContractTest(unittest.TestCase):
    def setUp(self):
        self.client = QdrantClient(location=":memory:")
        self.client.create_collection("contract", vectors_config=models.VectorParams(size=2, distance=models.Distance.COSINE))
        self.client.upsert("contract", points=[
            models.PointStruct(id=index, vector=[1.0, 0.0], payload={"content_type": kind, "document_id": identifier})
            for index, (kind, identifier) in enumerate([
                ("vault", "public"), ("vault", "private-or-deleted"), ("vault", "other-folder"), ("blog", "post")
            ], start=1)
        ])
        self.store = VectorSearchHarness(self.client)

    def tearDown(self):
        self.client.close()

    def test_query_api_rechecks_document_access_and_ignores_stale_vectors(self):
        scope = ContentAccessScope()
        hits = self.store._vector_search("질문", 5, set(), scope, frozenset())
        self.assertCountEqual([hit.note.id for hit in hits], ["public", "other-folder", "post"])
        self.assertIs(self.store.requested_scope, scope)
        self.assertTrue(all(hit.score > 1 for hit in hits))

    def test_content_type_is_filtered_before_document_lookup(self):
        hits = self.store._vector_search("질문", 5, set(), ContentAccessScope(), frozenset({"blog"}))
        self.assertEqual([hit.note.id for hit in hits], ["post"])
        self.assertEqual(self.store.references, [("blog", "post")])

    def test_folder_filter_still_limits_vault_documents(self):
        hits = self.store._vector_search("질문", 5, {"folder-a"}, ContentAccessScope(), frozenset({"vault"}))
        self.assertEqual([hit.note.id for hit in hits], ["public"])


if __name__ == "__main__":
    unittest.main()
