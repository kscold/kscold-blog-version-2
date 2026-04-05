#!/bin/bash
set -euo pipefail

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
REPO_ROOT=$(cd "${SCRIPT_DIR}/.." && pwd)
CONTAINER_NAME=${BLOG_CONTAINER:-ubuntu-blog}
RUN_BACKEND=1
RUN_FRONTEND=1
JAVA21_GRADLE_IMAGE=${JAVA21_GRADLE_IMAGE:-gradle:8.10.2-jdk21}

usage() {
  cat <<'EOF'
Usage: ./scripts/deploy-live-container.sh [--frontend-only] [--backend-only]

현재 운영 중인 ubuntu-blog 컨테이너에 산출물만 안전하게 덮어쓴 뒤 PM2를 재시작합니다.

Options:
  --frontend-only   프런트엔드만 배포합니다.
  --backend-only    백엔드만 배포합니다.
  -h, --help        도움말을 출력합니다.
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --frontend-only)
      RUN_BACKEND=0
      RUN_FRONTEND=1
      shift
      ;;
    --backend-only)
      RUN_BACKEND=1
      RUN_FRONTEND=0
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "알 수 없는 옵션입니다: $1" >&2
      usage
      exit 1
      ;;
  esac
done

if [[ "${RUN_BACKEND}" -eq 0 && "${RUN_FRONTEND}" -eq 0 ]]; then
  echo "배포 대상이 없습니다." >&2
  exit 1
fi

docker exec "${CONTAINER_NAME}" sh -lc 'true' >/dev/null

TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
BACKUP_DIR="/tmp/kscold-live-deploy-backups/${TIMESTAMP}"
mkdir -p "${BACKUP_DIR}"

has_java_21() {
  if ! command -v java >/dev/null 2>&1; then
    return 1
  fi

  java -version 2>&1 | head -1 | grep -Eq 'version "21|openjdk 21'
}

resolve_pnpm_runtime_version() {
  if ! command -v node >/dev/null 2>&1; then
    echo "8.15.4"
    return
  fi

  node -e "const pkg=require('${REPO_ROOT}/package.json'); process.stdout.write((pkg.packageManager || 'pnpm@8.15.4').split('@')[1]);"
}

wait_for_container_http() {
  local url="$1"
  local label="$2"
  local attempt=0

  until docker exec "${CONTAINER_NAME}" sh -lc "curl -fsS ${url} >/dev/null 2>&1"; do
    attempt=$((attempt + 1))
    if [[ "${attempt}" -ge 20 ]]; then
      echo "${label} 확인에 실패했습니다: ${url}" >&2
      return 1
    fi
    sleep 2
  done
}

PNPM_RUNTIME_VERSION=$(resolve_pnpm_runtime_version)

echo "[0/6] 배포 준비"
echo "  - repo: ${REPO_ROOT}"
echo "  - container: ${CONTAINER_NAME}"
echo "  - backup: ${BACKUP_DIR}"

if [[ "${RUN_BACKEND}" -eq 1 ]]; then
  echo "[1/6] 백엔드 빌드"
  if has_java_21; then
    (
      cd "${REPO_ROOT}/apps/api"
      ./gradlew bootJar
    )
  else
    docker run --rm \
      -v "${REPO_ROOT}:/workspace" \
      -w /workspace/apps/api \
      "${JAVA21_GRADLE_IMAGE}" \
      ./gradlew bootJar
  fi

  BACKEND_JAR=$(find "${REPO_ROOT}/apps/api/build/libs" -maxdepth 1 -type f -name '*.jar' ! -name '*plain*' | head -1)
  if [[ -z "${BACKEND_JAR}" ]]; then
    echo "백엔드 JAR 산출물을 찾지 못했습니다." >&2
    exit 1
  fi

  echo "[2/6] 백엔드 백업 및 반영"
  docker cp "${CONTAINER_NAME}:/app/backend/blog.jar" "${BACKUP_DIR}/blog.jar"
  docker cp "${BACKEND_JAR}" "${CONTAINER_NAME}:/app/backend/blog.jar"
  docker exec "${CONTAINER_NAME}" sh -lc 'pm2 restart kscold-blog-backend >/dev/null && pm2 save >/dev/null'
  wait_for_container_http "http://127.0.0.1:8080/api/health" "백엔드 헬스체크"
fi

if [[ "${RUN_FRONTEND}" -eq 1 ]]; then
  echo "[3/6] 프런트엔드 의존성 설치 및 빌드"
  (
    cd "${REPO_ROOT}"
    pnpm install --frozen-lockfile
    pnpm --dir apps/web build
  )

  FRONTEND_STAGE=$(mktemp -d)
  FRONTEND_TARBALL="/tmp/kscold-blog-frontend-runtime-${TIMESTAMP}.tgz"

  mkdir -p "${FRONTEND_STAGE}"
  cp -R "${REPO_ROOT}/apps/web/.next" "${FRONTEND_STAGE}/.next"
  cp -R "${REPO_ROOT}/apps/web/public" "${FRONTEND_STAGE}/public"
  cp "${REPO_ROOT}/apps/web/.next/standalone/apps/web/server.js" "${FRONTEND_STAGE}/server.js"
  cp "${REPO_ROOT}/apps/web/package.json" "${FRONTEND_STAGE}/package.json"
  cp "${REPO_ROOT}/pnpm-lock.yaml" "${FRONTEND_STAGE}/pnpm-lock.yaml"

  tar -czf "${FRONTEND_TARBALL}" -C "${FRONTEND_STAGE}" .
  rm -rf "${FRONTEND_STAGE}"

  echo "[4/6] 프런트엔드 백업 및 반영"
  docker exec "${CONTAINER_NAME}" sh -lc \
    "mkdir -p ${BACKUP_DIR} && tar -czf ${BACKUP_DIR}/apps-web.tar.gz -C /app/frontend/apps/web .next public server.js package.json pnpm-lock.yaml 2>/dev/null || true"
  docker cp "${FRONTEND_TARBALL}" "${CONTAINER_NAME}:/tmp/kscold-blog-frontend-runtime.tgz"
  docker exec "${CONTAINER_NAME}" sh -lc '
    cd /app/frontend/apps/web &&
    rm -rf .next public &&
    tar -xzf /tmp/kscold-blog-frontend-runtime.tgz -C /app/frontend/apps/web &&
    CI=1 npx -y pnpm@'"${PNPM_RUNTIME_VERSION}"' install --force --prod --frozen-lockfile --ignore-scripts &&
    pm2 restart kscold-blog-frontend >/dev/null &&
    pm2 save >/dev/null
  '
  rm -f "${FRONTEND_TARBALL}"

  echo "[5/6] 프런트엔드 확인"
  wait_for_container_http "http://127.0.0.1:3000/" "프런트엔드 응답"
fi

echo "[6/6] 최종 상태"
docker exec "${CONTAINER_NAME}" sh -lc 'pm2 list | grep -E "kscold-blog-(backend|frontend)" || true'
echo "배포가 완료되었습니다."
