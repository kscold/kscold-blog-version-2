FROM python:3.13.18-slim@sha256:8a7c3cd378e4e6dfa5d0ea4f6ca1a11068c951e3de3146ebc484eadf4b05a2be AS build

RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get upgrade -y && \
    rm -rf /var/lib/apt/lists/*

ARG PIP_VERSION=26.2.2
ARG SETUPTOOLS_VERSION=84.2.1

WORKDIR /service

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/service/src

COPY apps/agent/requirements.txt ./requirements.txt
RUN python -m pip install --no-cache-dir --upgrade \
    "pip==${PIP_VERSION}" \
    "setuptools==${SETUPTOOLS_VERSION}" && \
    python -m pip install --no-cache-dir -r requirements.txt

COPY apps/api/src/main/proto/vault_agent.proto ./proto/vault_agent.proto
COPY apps/agent/src ./src

RUN python -m grpc_tools.protoc \
    -I./proto \
    --python_out=./src/agent/grpc \
    --grpc_python_out=./src/agent/grpc \
    ./proto/vault_agent.proto && \
    sed -i 's/^import vault_agent_pb2/from . import vault_agent_pb2/' ./src/agent/grpc/vault_agent_pb2_grpc.py

# 설치 도구는 검증 단계에만 두고 실행 이미지에는 포함하지 않습니다.
FROM build AS verification

FROM build AS runtime

# pip의 vendored 의존성은 최신 pip에서도 별도 보안 패치를 기다리고 있습니다.
# pip 제거 후에도 동일한 의존성 검사를 수행하고 임시 검사 도구까지 정리합니다.
RUN cp -a /usr/local/lib/python3.13/site-packages/pip /tmp/pip && \
    python -m pip uninstall -y pip && \
    PYTHONPATH=/tmp python -m pip check && \
    rm -rf /tmp/pip && \
    python -c 'import ensurepip, pathlib, shutil; shutil.rmtree(pathlib.Path(ensurepip.__file__).parent)'

ARG AGENT_UID=10001
ARG AGENT_GID=10001

RUN groupadd --gid "${AGENT_GID}" vault-agent && \
    useradd --uid "${AGENT_UID}" --gid vault-agent --no-create-home --shell /usr/sbin/nologin vault-agent

USER vault-agent

EXPOSE 9090

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD ["python", "-c", "import os, socket; connection = socket.create_connection(('127.0.0.1', int(os.getenv('VAULT_AGENT_GRPC_PORT', '9090'))), timeout=3); connection.close()"]

CMD ["python", "-m", "agent.main"]
