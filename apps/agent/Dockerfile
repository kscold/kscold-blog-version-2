FROM python:3.11-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app

COPY apps/agent/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY apps/api/src/main/proto/vault_agent.proto ./proto/vault_agent.proto
COPY apps/agent/app ./app

RUN python -m grpc_tools.protoc \
    -I./proto \
    --python_out=./app/grpc \
    --grpc_python_out=./app/grpc \
    ./proto/vault_agent.proto && \
    sed -i 's/^import vault_agent_pb2/from . import vault_agent_pb2/' ./app/grpc/vault_agent_pb2_grpc.py

EXPOSE 9090

CMD ["python", "-m", "app.main"]
