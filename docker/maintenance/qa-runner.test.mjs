import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { mkdtemp, mkdir, readdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { createAdminVerifier } from './qa-runner/auth.mjs';
import { SUITES, loadConfig } from './qa-runner/config.mjs';
import { createSessionId, isScreenshotName, isSessionId } from './qa-runner/ids.mjs';
import { NO_MIRROR } from './qa-runner/minio.mjs';
import { buildRun } from './qa-runner/playwright.mjs';
import { SessionManager } from './qa-runner/sessions.mjs';
import { readManifest, screenshotDir, writeManifest } from './qa-runner/store.mjs';

const PNG = Buffer.from(
  '89504E470D0A1A0A0000000D49484452000000010000000108060000001F15C4890000000D49444154789C6360606060000000050001A5F645400000000049454E44AE426082',
  'hex'
);
const settle = () => new Promise(resolve => setTimeout(resolve, 20));
const newRoot = () => mkdtemp(join(tmpdir(), 'qa-runner-test-'));

/** 실제 브라우저 대신 쓰는 가짜 테스트 프로세스. 받은 종료 신호를 기록하고, 원하는 시점에 끝낼 수 있다. */
function fakeChild() {
  const child = new EventEmitter();
  child.stdout = new EventEmitter();
  child.stderr = new EventEmitter();
  child.signals = [];
  child.kill = signal => child.signals.push(signal);
  return child;
}

async function newManager({ mirror = NO_MIRROR, runTimeoutMs = 60_000, keepSessions = 20 } = {}) {
  const config = {
    ...loadConfig({}, '/web'),
    artifactRoot: await newRoot(),
    runTimeoutMs,
    keepSessions,
  };
  const children = [];
  const manager = new SessionManager({
    config,
    suites: SUITES,
    mirror,
    buildRun: ({ sessionRoot }) => ({ command: 'node', args: [sessionRoot], options: {} }),
    spawnProcess: () => {
      children.push(fakeChild());
      return children.at(-1);
    },
  });
  return { manager, config, children };
}

test('세션 ID와 파일 이름은 정해진 모양만 받아 폴더 밖을 가리킬 수 없다', () => {
  assert.ok(isSessionId(createSessionId('admin_smoke')));
  assert.ok(isSessionId('admin_smoke-1775204117576-f1f739f6'));
  for (const bad of ['..', '../etc', 'admin_smoke', 'a/b-1775204117576-f1f739f6', '', null, 42]) {
    assert.equal(isSessionId(bad), false);
  }
  assert.ok(isScreenshotName('01-dashboard.png'));
  for (const bad of ['../x.png', 'a/b.png', '.hidden.png', 'shot.jpg', 'a\\b.png']) {
    assert.equal(isScreenshotName(bad), false);
  }
});

test('기본 설정은 같은 기기에서만 접속을 받고, 보관소는 접속 정보가 모두 있을 때만 켠다', () => {
  const config = loadConfig({}, '/web');
  assert.equal(config.host, '127.0.0.1');
  assert.equal(config.authUrl, 'https://kscold.com/api/auth/me');
  assert.equal(config.minio, null);
  assert.equal(
    loadConfig({ MINIO_ENDPOINT: 'http://m:9000', MINIO_ACCESS_KEY: 'a' }, '/web').minio,
    null
  );
  const full = loadConfig(
    {
      MINIO_ENDPOINT: 'http://m:9000',
      MINIO_ACCESS_KEY: 'a',
      MINIO_SECRET_KEY: 's',
      BLOG_QA_RUNNER_PORT: 'x',
    },
    '/web'
  );
  assert.equal(full.minio.bucket, 'blog');
  assert.equal(full.port, 3305);
});

test('테스트 프로세스에는 실행에 필요한 값만 넘기고 보관소 접속 정보는 넘기지 않는다', () => {
  const run = buildRun({
    config: { ...loadConfig({}, '/web'), webDir: '/web' },
    suite: SUITES.admin_smoke,
    sessionRoot: '/artifacts/s1',
    env: { HOME: '/home/u', PATH: '/bin', MINIO_SECRET_KEY: 'secret', CI: '1' },
    resolveCli: () => '/web/cli.js',
  });
  assert.deepEqual(run.args.slice(0, 3), ['/web/cli.js', 'test', 'e2e/admin-smoke.spec.ts']);
  assert.ok(run.args.includes('--output=/artifacts/s1/playwright-output'));
  assert.equal(run.options.env.PLAYWRIGHT_BASE_URL, 'https://kscold.com');
  assert.equal(run.options.env.QA_SCREENSHOT_DIR, '/artifacts/s1/screenshots');
  assert.equal(run.options.env.HOME, '/home/u');
  assert.equal(run.options.env.MINIO_SECRET_KEY, undefined);
  assert.equal(run.options.env.CI, undefined);
});

test('관리자 확인은 백엔드의 답을 따르고, 통과한 토큰만 잠깐 기억한다', async () => {
  let calls = 0;
  let clock = 0;
  const responses = {
    admin: { status: 200, role: 'ADMIN' },
    user: { status: 200, role: 'USER' },
    bad: { status: 401 },
  };
  const fetcher = async (_url, { headers }) => {
    calls += 1;
    const { status, role } = responses[headers.Authorization.slice(7)];
    return { status, ok: status === 200, json: async () => ({ data: { role } }) };
  };
  const verify = createAdminVerifier({ authUrl: 'http://api/me', fetcher, now: () => clock });

  assert.equal((await verify(undefined)).status, 401);
  assert.equal((await verify('Bearer bad')).status, 401);
  assert.equal((await verify('Bearer user')).status, 403);
  assert.equal(calls, 2);
  assert.deepEqual(await verify('Bearer admin'), { ok: true });
  assert.deepEqual(await verify('Bearer admin'), { ok: true });
  assert.equal(calls, 3);
  clock = 31_000;
  await verify('Bearer admin');
  assert.equal(calls, 4);

  const offline = createAdminVerifier({
    authUrl: 'http://api/me',
    fetcher: async () => {
      throw new Error('down');
    },
  });
  assert.equal((await offline('Bearer admin')).status, 503);
});

test('실행이 끝나면 로그와 결과를 남기고, 도는 동안에는 새 실행을 받지 않는다', async () => {
  const { manager, config, children } = await newManager();
  await manager.start('admin_smoke');
  await assert.rejects(manager.start('admin_smoke'), { status: 409 });
  await assert.rejects(manager.start('unknown'), { status: 400 });

  const running = await manager.snapshot();
  assert.equal(running.status, 'running');
  await writeFile(join(screenshotDir(config.artifactRoot, running.id), '01-dashboard.png'), PNG);
  children[0].stdout.emit('data', Buffer.from('통과 · 01 대'));
  children[0].stdout.emit('data', Buffer.from('시보드 (0.4초)\n\u001b[32m모든 화면\u001b[0m\n'));
  children[0].emit('close', 0);
  await settle();

  const done = await manager.snapshot();
  assert.equal(done.status, 'completed');
  assert.equal(done.exitCode, 0);
  assert.ok(done.logs.some(line => line.endsWith('통과 · 01 대시보드 (0.4초)')));
  assert.ok(done.logs.some(line => line.endsWith('모든 화면')));
  assert.equal(done.latestScreenshotUrl, `/artifacts/${done.id}/screenshots/01-dashboard.png`);
  assert.equal((await readManifest(config.artifactRoot, done.id)).status, 'completed');
});

test('실패하면 마지막 화면을 스크린샷으로 옮기고 실패로 기록한다', async () => {
  const { manager, config, children } = await newManager();
  await manager.start('admin_smoke');
  const { id } = await manager.snapshot();
  const outputDir = join(config.artifactRoot, id, 'playwright-output', 'admin-smoke-chromium');
  await mkdir(outputDir, { recursive: true });
  await writeFile(join(outputDir, 'test-failed-1.png'), PNG);
  children[0].emit('close', 1);
  await settle();

  const failed = await manager.snapshot();
  assert.equal(failed.status, 'failed');
  assert.deepEqual(
    failed.screenshots.map(shot => shot.name),
    ['99-failure.png']
  );
  assert.deepEqual(await readdir(join(config.artifactRoot, id)), ['manifest.json', 'screenshots']);
});

test('중지 요청과 제한 시간 초과는 프로세스를 끝내고 이유를 로그에 남긴다', async () => {
  const stopped = await newManager();
  assert.equal(stopped.manager.stop(), false);
  await stopped.manager.start('admin_smoke');
  assert.equal(stopped.manager.stop(), true);
  assert.deepEqual(stopped.children[0].signals, ['SIGTERM']);
  stopped.children[0].emit('close', null);
  await settle();
  const afterStop = await stopped.manager.snapshot();
  assert.equal(afterStop.status, 'failed');
  assert.ok(afterStop.logs.some(line => line.includes('관리자가 실행을 중지했습니다')));

  const slow = await newManager({ runTimeoutMs: 10 });
  await slow.manager.start('admin_smoke');
  await settle();
  assert.deepEqual(slow.children[0].signals, ['SIGTERM']);
  slow.children[0].emit('close', 143);
  await settle();
  assert.ok((await slow.manager.snapshot()).logs.some(line => line.includes('제한 시간')));
});

test('삭제는 올바른 ID의 끝난 세션만 받고, 지우면 그 전 실행을 보여준다', async () => {
  const removed = [];
  const mirror = { ...NO_MIRROR, remove: async id => removed.push(id) };
  const { manager, children } = await newManager({ mirror });
  await assert.rejects(manager.remove('../../etc'), { status: 400 });

  await manager.start('admin_smoke');
  const first = (await manager.snapshot()).id;
  await assert.rejects(manager.remove(first), { status: 409 });
  children[0].emit('close', 0);
  await settle();
  await new Promise(resolve => setTimeout(resolve, 5));
  await manager.start('admin_smoke');
  const second = (await manager.snapshot()).id;
  children[1].emit('close', 0);
  await settle();

  await manager.remove(second);
  assert.deepEqual(removed, [second]);
  assert.equal((await manager.snapshot()).id, first);
});

test('러너가 실행 도중 재시작되면 끝나지 않은 기록을 중단으로 닫는다', async () => {
  const { manager, config } = await newManager();
  const id = createSessionId('admin_smoke');
  await writeManifest(config.artifactRoot, {
    id,
    suiteId: 'admin_smoke',
    suiteLabel: '어드민 UI 테스트 실행',
    status: 'running',
    startedAt: '2026-10-06T06:00:00.000Z',
    endedAt: null,
    exitCode: null,
    logs: ['15:00:00 실행 시작'],
    storedAt: '2026-10-06T06:00:01.000Z',
  });
  const session = await manager.snapshot();
  assert.equal(session.status, 'failed');
  assert.equal(session.endedAt, '2026-10-06T06:00:01.000Z');
  assert.ok(session.logs.at(-1).includes('러너가 다시 시작되어'));
});
