import assert from 'node:assert/strict';
import http from 'node:http';
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, test } from 'node:test';
import { createSessionId } from './qa-runner/ids.mjs';
import { createRequestHandler } from './qa-runner/server.mjs';
import { SessionError } from './qa-runner/sessions.mjs';
import { screenshotDir } from './qa-runner/store.mjs';

const PNG = Buffer.from(
  '89504E470D0A1A0A0000000D49484452000000010000000108060000001F15C4890000000D49444154789C6360606060000000050001A5F645400000000049454E44AE426082',
  'hex'
);
const ADMIN = { Authorization: 'Bearer admin' };
const servers = [];
after(() => servers.forEach(server => server.close()));

/** 세션 관리자를 흉내 내며 받은 호출을 기록한다. */
function fakeSessions() {
  const calls = [];
  return {
    calls,
    snapshot: async () => ({ id: 's1', status: 'completed' }),
    start: async suiteId => {
      calls.push(['start', suiteId]);
      if (suiteId === 'busy') throw new SessionError(409, '이미 실행 중인 테스트가 있습니다.');
      if (suiteId === 'boom') throw new Error('내부 경로 /secret/path');
    },
    stop: () => true,
    remove: async sessionId => calls.push(['remove', sessionId]),
  };
}

async function serve({ sessions = fakeSessions(), artifactRoot = '/nonexistent' } = {}) {
  const handle = createRequestHandler({
    sessions,
    artifactRoot,
    logError: () => {},
    verifyAdmin: async header =>
      header === ADMIN.Authorization
        ? { ok: true }
        : { ok: false, status: 401, message: '관리자 로그인이 필요합니다.' },
  });
  const server = http.createServer((req, res) => void handle(req, res));
  servers.push(server);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const call = (path, init = {}) => fetch(`${origin}${path}`, init);
  const post = (path, body, headers = ADMIN) =>
    call(path, {
      method: 'POST',
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  return { call, post, sessions };
}

test('상태 확인만 열려 있고, 나머지는 관리자 확인을 통과해야 한다', async () => {
  const { call, post, sessions } = await serve();
  assert.deepEqual(await (await call('/health')).json(), { ok: true });

  for (const response of [
    await call('/session'),
    await post('/session/start', {}, {}),
    await call('/artifacts/a/screenshots/b.png'),
  ]) {
    assert.equal(response.status, 401);
    assert.deepEqual(await response.json(), {
      message: '관리자 로그인이 필요합니다.',
      session: null,
    });
  }
  assert.deepEqual(sessions.calls, []);
});

test('세션 요청은 결과와 함께 현재 세션을 돌려준다', async () => {
  const { call, post, sessions } = await serve();
  const current = await call('/session', { headers: ADMIN });
  assert.deepEqual(await current.json(), { session: { id: 's1', status: 'completed' } });

  const started = await post('/session/start', {});
  assert.equal(started.status, 201);
  const stopped = await post('/session/stop');
  assert.equal((await stopped.json()).stopped, true);
  const deleted = await post('/session/delete', { sessionId: 's1' });
  assert.equal((await deleted.json()).deleted, true);
  assert.deepEqual(sessions.calls, [
    ['start', 'admin_smoke'],
    ['remove', 's1'],
  ]);
});

test('받을 수 없는 요청은 이유를 알리고, 내부 오류는 내용을 드러내지 않는다', async () => {
  const { call, post } = await serve();
  const busy = await post('/session/start', { suiteId: 'busy' });
  assert.equal(busy.status, 409);
  assert.equal((await busy.json()).message, '이미 실행 중인 테스트가 있습니다.');

  const boom = await post('/session/start', { suiteId: 'boom' });
  assert.equal(boom.status, 500);
  assert.equal((await boom.json()).message, '러너에서 요청을 처리하지 못했습니다.');

  const malformed = await call('/session/start', { method: 'POST', headers: ADMIN, body: '{' });
  assert.equal(malformed.status, 400);
  const huge = await post('/session/start', { padding: 'x'.repeat(70_000) });
  assert.equal(huge.status, 413);
  assert.equal((await call('/nowhere', { headers: ADMIN })).status, 404);
  assert.equal((await call('/session/start', { headers: ADMIN })).status, 404);
});

test('스크린샷은 세션 폴더 안의 PNG만 내주고 경로를 벗어난 요청은 거절한다', async () => {
  const artifactRoot = await mkdtemp(join(tmpdir(), 'qa-runner-server-'));
  const id = createSessionId('admin_smoke');
  await mkdir(screenshotDir(artifactRoot, id), { recursive: true });
  await writeFile(join(screenshotDir(artifactRoot, id), '01-dashboard.png'), PNG);
  await writeFile(join(artifactRoot, 'outside.png'), PNG);
  const { call } = await serve({ artifactRoot });

  const ok = await call(`/artifacts/${id}/screenshots/01-dashboard.png`, { headers: ADMIN });
  assert.equal(ok.status, 200);
  assert.equal(ok.headers.get('content-type'), 'image/png');
  assert.deepEqual(Buffer.from(await ok.arrayBuffer()), PNG);

  const escapes = [
    `/artifacts/${id}/screenshots/..%2F..%2Foutside.png`,
    `/artifacts/..%2F${id}/screenshots/01-dashboard.png`,
    `/artifacts/${id}/manifest.json`,
    `/artifacts/${id}/screenshots/01-dashboard.png/extra`,
    `/artifacts/${id}/screenshots/%E0%A4%A.png`,
    '/artifacts/../outside.png',
  ];
  for (const path of escapes) {
    assert.equal((await call(path, { headers: ADMIN })).status, 404, path);
  }
});
