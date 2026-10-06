#!/bin/bash
set -euo pipefail

# macOS는 예약 작업이 데스크탑·문서 폴더의 파일을 열려고 하면, 화면에서 허용을 눌러줄 때까지 그 자리에서 멈춘다.
# 화면을 보지 않는 운영 Mac에서도 매일 돌 수 있도록, 점검에 필요한 파일만 보호 대상이 아닌 위치로 복사해 거기서 실행한다.
# 점검 스크립트를 고친 뒤에는 이 설치를 다시 실행해야 예약 작업에 반영된다.

readonly REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
readonly INSTALL_ROOT="${HOME}/.local/share/kscold-seo-watch"
readonly STATE_DIR="${HOME}/.local/state/kscold-seo-watch"
readonly LABEL='com.kscold.seo-watch'
readonly PLIST_TARGET="${HOME}/Library/LaunchAgents/${LABEL}.plist"

# 저장소와 같은 상대 경로로 복사해, 스크립트가 키 파일을 찾는 방식을 그대로 쓴다.
rm -rf "${INSTALL_ROOT:?}/docker" "${INSTALL_ROOT:?}/apps"
mkdir -p "${INSTALL_ROOT}/docker/maintenance" "${INSTALL_ROOT}/apps/web/public" "${STATE_DIR}"
cp "${REPO_ROOT}/docker/maintenance/seo-watch.mjs" "${INSTALL_ROOT}/docker/maintenance/"
cp -R "${REPO_ROOT}/docker/maintenance/seo-watch" "${INSTALL_ROOT}/docker/maintenance/"

key_count=0
for key_file in "${REPO_ROOT}"/apps/web/public/*.txt; do
  name="$(basename "${key_file}" .txt)"
  if [[ "${name}" =~ ^[a-f0-9]{32}$ ]]; then
    cp "${key_file}" "${INSTALL_ROOT}/apps/web/public/"
    key_count=$((key_count + 1))
  fi
done
if [[ "${key_count}" -eq 0 ]]; then
  echo "IndexNow 키 파일을 찾지 못했습니다. apps/web/public/<키>.txt 를 확인하세요." >&2
  exit 1
fi

cp "${REPO_ROOT}/docker/com.kscold.seo-watch.plist" "${PLIST_TARGET}"
launchctl bootout "gui/$(id -u)/${LABEL}" 2>/dev/null || true
launchctl bootstrap "gui/$(id -u)" "${PLIST_TARGET}"

echo "설치 위치: ${INSTALL_ROOT}"
echo "예약 작업: ${LABEL} (매일 07:30)"
echo "바로 한 번 돌려보려면: launchctl kickstart gui/$(id -u)/${LABEL}"
