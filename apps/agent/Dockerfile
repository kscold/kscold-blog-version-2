FROM ubuntu:24.04@sha256:24737cef17f4e22b1977df7d9a05e77c4e28b7da5b8911f8d8ccda136bf3573c AS base

RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get upgrade -y && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends ca-certificates tzdata && \
    rm -rf /var/lib/apt/lists/*

FROM base AS python-build

ARG PYTHON_VERSION=3.13.18
ARG PYTHON_SHA256=abb0102e6d4ae027509bcb82327d9dd85515b44a3ba8ad538cfc5e9847029f68

RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
      gcc make pkg-config curl xz-utils libssl-dev zlib1g-dev libbz2-dev \
      liblzma-dev libreadline-dev libsqlite3-dev libffi-dev libgdbm-dev \
      libgdbm-compat-dev libncurses-dev uuid-dev && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /tmp/python-src

# Ubuntu의 시스템 Python을 덮어쓰지 않고 공식 CPython을 별도 설치합니다.
RUN curl --fail --location --retry 3 \
      "https://www.python.org/ftp/python/${PYTHON_VERSION}/Python-${PYTHON_VERSION}.tar.xz" \
      --output /tmp/python.tar.xz && \
    echo "${PYTHON_SHA256}  /tmp/python.tar.xz" | sha256sum --check - && \
    tar --extract --xz --file /tmp/python.tar.xz --directory /tmp/python-src --strip-components=1 && \
    ./configure --enable-shared --enable-optimizations --with-ensurepip=install && \
    make -j"$(nproc)" && \
    make altinstall && \
    ln -s python3.13 /usr/local/bin/python && \
    rm -rf /tmp/python-src /tmp/python.tar.xz

FROM base AS build

ENV PATH=/usr/local/bin:$PATH \
    LANG=C.UTF-8

RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
      libssl3t64 zlib1g libbz2-1.0 liblzma5 libreadline8t64 libsqlite3-0 \
      libffi8 libgdbm6t64 libgdbm-compat4t64 libncursesw6 libuuid1 && \
    rm -rf /var/lib/apt/lists/*

COPY --from=python-build /usr/local /usr/local
RUN ldconfig && python --version

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
