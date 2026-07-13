from concurrent import futures

import grpc

from app.config import AgentConfig
from app.graph import VaultRagGraph
from app.grpc import vault_agent_pb2, vault_agent_pb2_grpc


class VaultAgentServicer(vault_agent_pb2_grpc.VaultAgentServiceServicer):
    def __init__(self, config: AgentConfig):
        self.graph = VaultRagGraph(config)

    def Chat(self, request, context):
        result = self.graph.chat(request.message, request.active_folder_name)
        return vault_agent_pb2.ChatResponse(
            answer=result["answer"],
            stages=[
                vault_agent_pb2.AgentStage(name=stage["name"], detail=stage["detail"])
                for stage in result["stages"]
            ],
            sources=[
                vault_agent_pb2.SourceNote(
                    id=hit.note.id,
                    title=hit.note.title,
                    slug=hit.note.slug,
                    score=hit.score,
                    type=hit.note.content_type,
                    path=hit.note.path or f"/vault/{hit.note.slug}",
                )
                for hit in result["context"]
            ],
            follow_ups=result.get("follow_ups", []),
        )

    def Reindex(self, request, context):
        total, indexed, skipped = self.graph.reindex(force=request.force)
        return vault_agent_pb2.ReindexResponse(
            total_notes=total,
            indexed_notes=indexed,
            skipped_notes=skipped,
        )

    def start_index_sync(self):
        self.graph.start_index_sync()

    def stop_index_sync(self):
        self.graph.stop_index_sync()


def serve(config: AgentConfig) -> None:
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=8))
    servicer = VaultAgentServicer(config)
    vault_agent_pb2_grpc.add_VaultAgentServiceServicer_to_server(servicer, server)
    server.add_insecure_port(f"[::]:{config.grpc_port}")
    server.start()
    servicer.start_index_sync()
    print(f"Vault Agent gRPC server started on {config.grpc_port}", flush=True)
    try:
        server.wait_for_termination()
    finally:
        servicer.stop_index_sync()
