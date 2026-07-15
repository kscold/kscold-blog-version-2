from __future__ import annotations

from concurrent import futures

import grpc

from agent.config import AgentConfig
from agent.grpc import vault_agent_pb2_grpc
from agent.server.grpc_servicer import VaultAgentServicer


def serve(config: AgentConfig) -> None:
    """프로세스 수명주기 동안 하나의 Agent 애플리케이션과 색인 동기화를 유지합니다."""

    server = grpc.server(futures.ThreadPoolExecutor(max_workers=8))
    servicer = VaultAgentServicer(config)
    vault_agent_pb2_grpc.add_VaultAgentServiceServicer_to_server(servicer, server)
    server.add_insecure_port(f"[::]:{config.grpc_port}")
    server.start()
    servicer.start()
    print(f"Vault Agent gRPC 서버를 {config.grpc_port} 포트에서 시작했습니다.", flush=True)
    try:
        server.wait_for_termination()
    finally:
        servicer.stop()
