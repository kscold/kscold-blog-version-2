import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { SUITES, loadConfig } from './qa-runner/config.mjs';
import { createSessionId } from './qa-runner/ids.mjs';
import { createMinioMirror } from './qa-runner/minio.mjs';
import { SessionManager } from './qa-runner/sessions.mjs';
import {
  listScreenshots,
  listSessionIds,
  pruneSessions,
  screenshotDir,
} from './qa-runner/store.mjs';

const PNG = Buffer.from(
  '89504E470D0A1A0A0000000D49484452000000010000000108060000001F15C4890000000D49444154789C6360606060000000050001A5F645400000000049454E44AE426082',
  'hex'
);
const settle = () => new Promise(resolve => setTimeout(resolve, 20));
const newRoot = () => mkdtemp(join(tmpdir(), 'qa-runner-storage-'));

/** 보관 동작만 보려는 세션 관리자. 테스트 프로세스는 바로 끝낼 수 있는 가짜로 바꾼다. */
async function newManager(mirror) {
  const config = { ...loadConfig({}, '/web'), artifactRoot: await newRoot() };
  const children = [];
  const manager = new SessionManager({
    config,
    suites: SUITES,
    mirror,
    buildRun: () => ({ command: 'node', args: [], options: {} }),
    spawnProcess: () => {
      const child = Object.assign(new EventEmitter(), {
        stdout: new EventEmitter(),
        stderr: new EventEmitter(),
        kill: () => {},
      });
      children.push(child);
      return child;
    },
  });
  return { manager, config, children };
}

test('쓰는 중인 스크린샷은 목록에서 빼고 끝까지 기록된 PNG만 보여준다', async () => {
  const root = await newRoot();
  const id = createSessionId('admin_smoke');
  await mkdir(screenshotDir(root, id), { recursive: true });
  await writeFile(join(screenshotDir(root, id), '02-posts.png'), PNG);
  await writeFile(join(screenshotDir(root, id), '01-dashboard.png'), PNG);
  await writeFile(join(screenshotDir(root, id), '03-writing.png'), PNG.subarray(0, 30));
  await writeFile(join(screenshotDir(root, id), 'notes.txt'), 'x');
  assert.deepEqual(await listScreenshots(root, id), ['01-dashboard.png', '02-posts.png']);
});

test('오래된 세션은 최근 것만 남기고 정리한다', async () => {
  const root = await mkdtemp(join(tmpdir(), 'qa-runner-prune-'));
  const ids = [1, 2, 3, 4].map(order => createSessionId('admin_smoke', 1_775_000_000_000 + order));
  for (const id of ids) await mkdir(join(root, id), { recursive: true });
  await mkdir(join(root, 'not-a-session'), { recursive: true });

  assert.deepEqual(await pruneSessions(root, 2), [ids[1], ids[0]]);
  assert.deepEqual(await listSessionIds(root), [ids[3], ids[2]]);
});

test('보관소에는 세션 폴더 아래로만 올리고, 보관에 실패해도 실행 결과는 남긴다', async () => {
  const sent = [];
  const sdk = {
    S3Client: class {
      async send(command) {
        sent.push(command);
        return { Contents: [{ Key: 'qa-artifacts/x/manifest.json' }], IsTruncated: false };
      }
    },
    PutObjectCommand: class {
      constructor(input) {
        Object.assign(this, { kind: 'put', ...input });
      }
    },
    ListObjectsV2Command: class {
      constructor(input) {
        Object.assign(this, { kind: 'list', ...input });
      }
    },
    DeleteObjectsCommand: class {
      constructor(input) {
        Object.assign(this, { kind: 'delete', ...input });
      }
    },
  };
  const settings = loadConfig(
    { MINIO_ENDPOINT: 'http://m:9000', MINIO_ACCESS_KEY: 'a', MINIO_SECRET_KEY: 's' },
    '/web'
  ).minio;
  const mirror = await createMinioMirror(settings, async () => sdk);
  const { manager, config, children } = await newManager(mirror);
  await manager.start('admin_smoke');
  const { id } = await manager.snapshot();
  await writeFile(join(screenshotDir(config.artifactRoot, id), '01-dashboard.png'), PNG);
  children[0].emit('close', 0);
  await settle();

  const keys = sent.filter(command => command.kind === 'put').map(command => command.Key);
  assert.deepEqual(keys, [
    `qa-artifacts/${id}/screenshots/01-dashboard.png`,
    `qa-artifacts/${id}/manifest.json`,
  ]);
  const uploaded = JSON.parse(
    await readFile(join(config.artifactRoot, id, 'manifest.json'), 'utf8')
  );
  assert.ok(uploaded.logs.some(line => line.includes('MinIO에 보관')));

  await manager.remove(id);
  assert.equal(sent.find(command => command.kind === 'list').Prefix, `qa-artifacts/${id}/`);
  await assert.rejects(mirror.remove('..'), /세션 ID/);

  const broken = {
    enabled: true,
    label: 'x',
    upload: async () => Promise.reject(new Error('연결 거부')),
    remove: async () => {},
  };
  const failing = await newManager(broken);
  await failing.manager.start('admin_smoke');
  failing.children[0].emit('close', 0);
  await settle();
  const kept = await failing.manager.snapshot();
  assert.equal(kept.status, 'completed');
  assert.ok(kept.logs.some(line => line.includes('결과 보관 중 문제가 생겼습니다: 연결 거부')));
});
