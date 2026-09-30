import { execFileSync } from 'node:child_process';
import { appendFileSync, mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ACTIVE_NAME = '/kscold-vault-agent';
const BACKUP_NAME = /^\/kscold-vault-agent-backup-[a-zA-Z0-9][a-zA-Z0-9_.-]*$/;
const IMAGE_PREFIX = 'kscold/vault-agent:';
const KEEP = 2;
const MIN_AGE_MS = 24 * 60 * 60 * 1000;
const HEALTH_GRACE_MS = 15 * 60 * 1000;
const MAX_WRITABLE_BYTES = 1024 * 1024;

function elapsed(timestamp, now) {
  const time = Date.parse(timestamp);
  return Number.isFinite(time) && time > 0 && time <= now ? now - time : -1;
}

function isStatelessBackup(container) {
  return (
    BACKUP_NAME.test(container.Name) &&
    container.Config?.Image?.startsWith(IMAGE_PREFIX) &&
    container.State?.Status === 'exited' &&
    container.State.Running === false &&
    Array.isArray(container.Mounts) &&
    container.Mounts.length === 0 &&
    Number.isSafeInteger(container.SizeRw) &&
    container.SizeRw >= 0 &&
    container.SizeRw <= MAX_WRITABLE_BYTES
  );
}

export function planRetention(containers, now = Date.now()) {
  const active = containers.find(container => container.Name === ACTIVE_NAME);
  const safe =
    active?.Config?.Image?.startsWith(IMAGE_PREFIX) &&
    active.State?.Status === 'running' &&
    active.State.Running === true &&
    active.State.Health?.Status === 'healthy' &&
    elapsed(active.State.StartedAt, now) >= HEALTH_GRACE_MS;
  if (!safe)
    return {
      active,
      blocked: '운영 Agent가 없거나 정상 기동 유예 시간 미충족',
      keep: [],
      remove: [],
    };

  const backups = containers
    .filter(
      container => isStatelessBackup(container) && elapsed(container.State.FinishedAt, now) >= 0
    )
    .sort(
      (left, right) =>
        Date.parse(right.State.FinishedAt) - Date.parse(left.State.FinishedAt) ||
        left.Id.localeCompare(right.Id)
    );
  return {
    active,
    blocked: null,
    keep: backups.slice(0, KEEP),
    remove: backups
      .slice(KEEP)
      .filter(container => elapsed(container.State.FinishedAt, now) >= MIN_AGE_MS),
  };
}

function identity(container) {
  return { id: container.Id, name: container.Name.slice(1), image: container.Image };
}

function sameRuntime(left, right) {
  return (
    left?.Id === right?.Id &&
    left?.Image === right?.Image &&
    left?.State.StartedAt === right?.State.StartedAt
  );
}

export function dockerClient(binary = '/usr/local/bin/docker') {
  const run = args =>
    execFileSync(binary, ['--context', 'colima', ...args], {
      encoding: 'utf8',
      timeout: 30_000,
      maxBuffer: 16 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
  return {
    snapshot() {
      const ids = run(['ps', '-aq', '--no-trunc', '--filter', 'name=kscold-vault-agent'])
        .split(/\s+/)
        .filter(Boolean);
      return ids.length ? JSON.parse(run(['inspect', '--size', ...ids])) : [];
    },
    removeContainer(id) {
      run(['rm', id]);
    },
    imageInUse(id) {
      return Boolean(run(['ps', '-aq', '--filter', `ancestor=${id}`]));
    },
    inspectImage(id) {
      return JSON.parse(run(['image', 'inspect', id]))[0];
    },
    removeImage(id) {
      run(['image', 'rm', id]);
    },
  };
}

function pruneImage(client, imageId, { report, record }) {
  if (client.imageInUse(imageId)) return;
  const tags = client.inspectImage(imageId).RepoTags;
  // 별도 별칭이 붙은 이미지는 보존하고, 가변 태그 대신 불변 ID로만 삭제한다.
  if (tags?.length !== 1 || !tags[0].startsWith(IMAGE_PREFIX)) return;
  if (client.imageInUse(imageId)) return;
  record({ action: 'image-remove-planned', image: imageId, tags });
  client.removeImage(imageId);
  report.imagesRemoved.push(imageId);
  record({ action: 'image-removed', image: imageId, tags });
}

function pruneRetiredImages({ client, now, record, report }, images, active) {
  for (const id of images) {
    const current = planRetention(client.snapshot(), now);
    if (current.blocked || !sameRuntime(active, current.active)) {
      report.blocked = '운영 Agent 상태가 변경되어 이미지 정리 중단';
      break;
    }
    pruneImage(client, id, { report, record });
  }
}

export function runRetention({
  client,
  apply = false,
  pruneImages = false,
  now = Date.now(),
  record = () => {},
}) {
  const initial = planRetention(client.snapshot(), now);
  const report = {
    dryRun: !apply,
    blocked: initial.blocked,
    keep: initial.keep.map(identity),
    candidates: initial.remove.map(identity),
    removed: [],
    imagesRemoved: [],
  };
  if (!apply || initial.blocked) return report;
  const images = new Set();
  for (const candidate of initial.remove) {
    // 삭제 직전 재조회하며 배포 또는 롤백이 시작되었으면 남은 정리를 중단한다.
    const current = planRetention(client.snapshot(), now);
    if (current.blocked || !sameRuntime(initial.active, current.active)) {
      report.blocked = '운영 Agent 상태가 변경되어 정리 중단';
      return report;
    }
    const fresh = current.remove.find(
      container =>
        container.Id === candidate.Id &&
        container.Name === candidate.Name &&
        container.Image === candidate.Image
    );
    if (!fresh) continue;
    record({ action: 'container-remove-planned', ...identity(fresh) });
    // 강제 삭제와 볼륨 삭제 옵션은 의도적으로 사용하지 않는다.
    client.removeContainer(fresh.Id);
    report.removed.push(identity(fresh));
    images.add(fresh.Image);
    record({ action: 'container-removed', ...identity(fresh) });
  }
  if (pruneImages) {
    pruneRetiredImages({ client, now, record, report }, images, initial.active);
  }
  return report;
}

function main() {
  const args = process.argv.slice(2);
  if (args.some(arg => !['--apply', '--prune-images'].includes(arg))) {
    throw new Error(
      '사용법: node docker/maintenance/agent-backup-retention.mjs [--apply] [--prune-images]'
    );
  }
  const auditDirectory = join(homedir(), '.local/state/kscold-agent-retention');
  const record = event => {
    mkdirSync(auditDirectory, { recursive: true, mode: 0o700 });
    // 환경 변수, 명령 인자, 접속 키는 기록하지 않는다.
    appendFileSync(
      join(auditDirectory, 'audit.jsonl'),
      `${JSON.stringify({ at: new Date().toISOString(), ...event })}\n`,
      { mode: 0o600 }
    );
  };
  const report = runRetention({
    client: dockerClient(process.env.DOCKER_BIN),
    apply: args.includes('--apply'),
    pruneImages: args.includes('--prune-images'),
    record,
  });
  console.log(JSON.stringify(report, null, 2));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    main();
  } catch (error) {
    // Docker 원문 오류에는 호출 인자가 포함될 수 있어 반환하지 않는다.
    console.error(
      `Agent 백업 정리 실패 (${error.code ?? error.status ?? error.name}); 강제 삭제하지 않았습니다.`
    );
    process.exitCode = 1;
  }
}
