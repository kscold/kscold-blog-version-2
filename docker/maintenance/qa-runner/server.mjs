import { promises as fs } from 'node:fs';
import { SessionError } from './sessions.mjs';
import { resolveScreenshot } from './store.mjs';

const BODY_LIMIT = 64 * 1024;
const DEFAULT_SUITE = 'admin_smoke';

function writeJson(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(JSON.stringify(payload));
}

async function readJsonBody(req) {
  let raw = '';
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > BODY_LIMIT) throw new SessionError(413, '요청 본문이 너무 큽니다.');
  }
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    throw new SessionError(400, '요청 본문을 읽지 못했습니다.');
  }
}

/** `/artifacts/<세션>/screenshots/<파일>` 꼴의 요청만 받아 해당 PNG를 내준다. */
async function sendScreenshot(res, artifactRoot, pathname) {
  let parts;
  try {
    parts = pathname.split('/').filter(Boolean).map(decodeURIComponent);
  } catch {
    parts = [];
  }
  const [, sessionId, folder, name, ...extra] = parts;
  const path =
    folder === 'screenshots' && extra.length === 0
      ? resolveScreenshot(artifactRoot, sessionId, name)
      : null;
  const content = path ? await fs.readFile(path).catch(() => null) : null;
  if (!content) {
    writeJson(res, 404, { message: '스크린샷을 찾지 못했습니다.' });
    return;
  }
  res.writeHead(200, { 'Content-Type': 'image/png', 'Cache-Control': 'no-store' });
  res.end(content);
}

function buildRoutes(sessions) {
  const withSession = async (extra = {}) => ({ ...extra, session: await sessions.snapshot() });
  return {
    'GET /session': async () => [200, await withSession()],
    'POST /session/start': async body => {
      await sessions.start(typeof body.suiteId === 'string' ? body.suiteId : DEFAULT_SUITE);
      return [201, await withSession()];
    },
    'POST /session/stop': async () => {
      const stopped = sessions.stop();
      return [200, await withSession({ stopped })];
    },
    'POST /session/delete': async body => {
      await sessions.remove(body.sessionId);
      return [200, await withSession({ deleted: true })];
    },
  };
}

/**
 * 러너의 HTTP 창구. 상태 확인 하나를 빼면 모든 요청이 관리자 확인을 거친다.
 * 실패한 요청에도 현재 세션을 함께 실어, 화면이 응답 하나로 상태를 맞출 수 있게 한다.
 */
export function createRequestHandler({
  sessions,
  verifyAdmin,
  artifactRoot,
  logError = console.error,
}) {
  const routes = buildRoutes(sessions);

  return async function handle(req, res) {
    const { pathname } = new URL(req.url || '/', 'http://qa-runner.local');
    if (req.method === 'GET' && pathname === '/health') {
      writeJson(res, 200, { ok: true });
      return;
    }
    const admin = await verifyAdmin(req.headers.authorization);
    if (!admin.ok) {
      writeJson(res, admin.status, { message: admin.message, session: null });
      return;
    }
    if (req.method === 'GET' && pathname.startsWith('/artifacts/')) {
      await sendScreenshot(res, artifactRoot, pathname);
      return;
    }
    const route = routes[`${req.method} ${pathname}`];
    if (!route) {
      writeJson(res, 404, { message: '없는 경로입니다.' });
      return;
    }
    try {
      const [status, payload] = await route(req.method === 'POST' ? await readJsonBody(req) : {});
      writeJson(res, status, payload);
    } catch (error) {
      const known = error instanceof SessionError;
      if (!known) logError(error);
      const message = known ? error.message : '러너에서 요청을 처리하지 못했습니다.';
      const session = await sessions.snapshot().catch(() => null);
      writeJson(res, known ? error.status : 500, { message, session });
    }
  };
}
