#!/bin/bash
set -euo pipefail

# 어드민의 QA / E2E 화면이 부르는 러너를 이 Mac의 상시 서비스로 설치한다.
# macOS는 예약 작업이 데스크탑·문서 폴더의 파일을 열려고 하면 화면에서 허용을 눌러줄 때까지 멈추므로,
# 러너와 스모크 스펙, Playwright를 보호 대상이 아닌 위치에 따로 두고 거기서 실행한다.
# 러너나 스모크 스펙을 고친 뒤, 그리고 프런트엔드를 배포한 뒤에 다시 실행해 운영 화면과 스펙을 맞춘다.

readonly REPO_ROOT="${BLOG_QA_INSTALL_SOURCE:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)}"
readonly WEB_DIR="${REPO_ROOT}/apps/web"
readonly INSTALL_ROOT="${BLOG_QA_INSTALL_ROOT:-${HOME}/.local/share/kscold-blog-qa}"
readonly STATE_DIR="${BLOG_QA_INSTALL_STATE_DIR:-${HOME}/.local/state/kscold-blog-qa}"
readonly CONFIG_DIR="${BLOG_QA_INSTALL_CONFIG_DIR:-${HOME}/.config/kscold-blog-qa}"
readonly LABEL="${BLOG_QA_INSTALL_LABEL:-com.kscold.blog-qa-runner}"
readonly DOMAIN="gui/$(id -u)"
readonly PLIST_TARGET="${BLOG_QA_INSTALL_PLIST:-${HOME}/Library/LaunchAgents/${LABEL}.plist}"
readonly PORT="${BLOG_QA_INSTALL_PORT:-3305}"
readonly AUTH_URL="${BLOG_QA_INSTALL_AUTH_URL:-http://127.0.0.1:8083/api/auth/me}"
readonly BASE_URL="${BLOG_QA_INSTALL_BASE_URL:-https://kscold.com}"
# 스모크 시나리오가 불러오는 파일들. 스펙의 import가 늘면 여기에도 더한다. 빠뜨리면 아래 목록 확인에서 걸린다.
readonly SPEC_FILES=(
  playwright.config.ts
  e2e/admin-smoke.spec.ts
  e2e/support/adminSmokeFixtures.ts
  e2e/support/api.ts
  e2e/support/auth.ts
  e2e/support/qaRunReporter.ts
)

node_bin="$(command -v node)"
npm_bin="$(dirname "${node_bin}")/npm"

check_space() {
  df -h "$HOME"
  local available
  available=$(df -Pk "$HOME" | awk 'NR==2 { print $4 }')
  [[ "$available" =~ ^[0-9]+$ ]] && (( available >= 15 * 1024 * 1024 )) || {
    echo '호스트 여유 공간 15GiB 미만으로 QA 설치를 중단함' >&2
    exit 1
  }
}

installed_version() {
  "${node_bin}" -p "require('$1/package.json').version"
}

copy_sources() {
  rm -rf "${INSTALL_ROOT:?}/runner" "${INSTALL_ROOT:?}/web"
  mkdir -p "${INSTALL_ROOT}/runner" "${INSTALL_ROOT}/web/e2e/support" "${STATE_DIR}"
  cp "${REPO_ROOT}/docker/maintenance/qa-runner.mjs" "${INSTALL_ROOT}/runner/"
  cp -R "${REPO_ROOT}/docker/maintenance/qa-runner" "${INSTALL_ROOT}/runner/"
  local file
  for file in "${SPEC_FILES[@]}"; do
    cp "${WEB_DIR}/${file}" "${INSTALL_ROOT}/web/${file}"
  done
}

# 저장소가 쓰는 것과 같은 판을 설치해, 로컬·CI에서 통과한 스펙이 러너에서도 같은 엔진으로 돈다.
install_dependencies() {
  local manifest
  manifest=$(cat <<JSON
{
  "name": "kscold-blog-qa-runner",
  "private": true,
  "dependencies": {
    "@aws-sdk/client-s3": "$(installed_version "${REPO_ROOT}/node_modules/@aws-sdk/client-s3")",
    "@playwright/test": "$(installed_version "${WEB_DIR}/node_modules/@playwright/test")"
  }
}
JSON
)
  if [[ -d "${INSTALL_ROOT}/node_modules" && "$(cat "${INSTALL_ROOT}/package.json" 2>/dev/null)" == "${manifest}" ]]; then
    return
  fi
  if [[ -n "${BLOG_QA_DEPENDENCIES_FROM:-}" ]]; then
    if [[ "$(cat "${BLOG_QA_DEPENDENCIES_FROM}/package.json")" != "${manifest}" ]]; then
      echo '사전 준비한 QA 의존성과 배포 스펙 버전이 다름' >&2
      exit 1
    fi
    rm -rf "${INSTALL_ROOT:?}/node_modules"
    cp -cR "${BLOG_QA_DEPENDENCIES_FROM}/node_modules" "${INSTALL_ROOT}/node_modules"
    printf '%s\n' "${manifest}" > "${INSTALL_ROOT}/package.json"
    return
  fi
  check_space
  printf '%s\n' "${manifest}" > "${INSTALL_ROOT}/package.json"
  (cd "${INSTALL_ROOT}" && "${npm_bin}" install --no-audit --no-fund --loglevel=error)
}

verify_playwright() {
  local cli="${INSTALL_ROOT}/node_modules/@playwright/test/cli.js"
  check_space
  (cd "${INSTALL_ROOT}/web" && "${node_bin}" "${cli}" install chromium)
  if ! (cd "${INSTALL_ROOT}/web" && "${node_bin}" "${cli}" test --list e2e/admin-smoke.spec.ts >/dev/null); then
    echo "설치본에서 스모크 스펙을 읽지 못했습니다. SPEC_FILES에 빠진 파일이 없는지 확인하세요." >&2
    exit 1
  fi
}

# 접속 정보는 저장소 밖에 둔다. 이미 있는 파일은 건드리지 않는다.
ensure_env_file() {
  mkdir -p "${CONFIG_DIR}"
  chmod 700 "${CONFIG_DIR}"
  if [[ -f "${CONFIG_DIR}/env" ]]; then
    return
  fi
  cat > "${CONFIG_DIR}/env" <<'ENV'
# 실행 결과를 MinIO에도 보관하려면 세 값을 모두 채운다. 비워 두면 로컬에만 남긴다.
# MINIO_ENDPOINT=http://127.0.0.1:9000
# MINIO_ACCESS_KEY=
# MINIO_SECRET_KEY=
ENV
  chmod 600 "${CONFIG_DIR}/env"
}

restart_service() {
  python3 - "${node_bin}" "${INSTALL_ROOT}" "${STATE_DIR}" "${CONFIG_DIR}" \
    "${LABEL}" "${PLIST_TARGET}" "${PORT}" "${AUTH_URL}" "${BASE_URL}" <<'PYPLIST'
import os, pathlib, plistlib, sys
node, install, state, config, label, target, port, auth, base = sys.argv[1:]
environment = {
    'HOME': str(pathlib.Path.home()), 'PATH': str(pathlib.Path(node).parent) + ':/usr/bin:/bin:/usr/sbin:/sbin',
    'BLOG_QA_RUNNER_WEB_DIR': install + '/web', 'BLOG_QA_RUNNER_STATE_DIR': state,
    'BLOG_QA_RUNNER_ENV_FILE': config + '/env', 'BLOG_QA_RUNNER_AUTH_URL': auth,
    'BLOG_QA_RUNNER_BASE_URL': base, 'BLOG_QA_RUNNER_PORT': port,
}
if os.environ.get('PLAYWRIGHT_BROWSERS_PATH'):
    environment['PLAYWRIGHT_BROWSERS_PATH'] = os.environ['PLAYWRIGHT_BROWSERS_PATH']
value = {'Label': label, 'ProgramArguments': [node, install + '/runner/qa-runner.mjs'],
         'RunAtLoad': True, 'KeepAlive': True, 'ThrottleInterval': 10,
         'EnvironmentVariables': environment, 'StandardOutPath': state + '/launchd.log',
         'StandardErrorPath': state + '/launchd.error.log'}
pathlib.Path(target).parent.mkdir(parents=True, exist_ok=True)
with open(target, 'wb') as stream:
    plistlib.dump(value, stream)
PYPLIST
  launchctl bootout "${DOMAIN}/${LABEL}" 2>/dev/null || true
  local attempt
  for attempt in $(seq 1 25); do
    launchctl print "${DOMAIN}/${LABEL}" >/dev/null 2>&1 || break
    sleep 0.2
  done
  launchctl bootstrap "${DOMAIN}" "${PLIST_TARGET}"
  for attempt in $(seq 1 50); do
    if curl --fail --silent --max-time 2 "http://127.0.0.1:${PORT}/health" >/dev/null; then
      return 0
    fi
    sleep 0.2
  done
  echo "러너가 응답하지 않습니다. ${STATE_DIR}/launchd.error.log 를 확인하세요." >&2
  return 1
}

copy_sources
install_dependencies
verify_playwright
ensure_env_file
if [[ "${BLOG_QA_STAGE_ONLY:-0}" != 1 ]]; then restart_service; fi

echo "설치 위치: ${INSTALL_ROOT}"
echo "서비스: ${LABEL} (http://127.0.0.1:${PORT}, 로그인 시 자동 시작)"
echo "실행 결과: ${STATE_DIR}/artifacts"
echo "접속 정보: ${CONFIG_DIR}/env"
