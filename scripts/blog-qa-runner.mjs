#!/usr/bin/env node

import http from 'node:http';
import { spawn } from 'node:child_process';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const BLOG_WEB_DIR = process.env.BLOG_QA_RUNNER_WEB_DIR || path.join(REPO_ROOT, 'apps', 'web');
const ARTIFACT_ROOT = process.env.BLOG_QA_RUNNER_ARTIFACT_ROOT || '/tmp/kscold-blog-qa-artifacts';
const PORT = Number(process.env.BLOG_QA_RUNNER_PORT || '3305');
const HOST = process.env.BLOG_QA_RUNNER_HOST || '0.0.0.0';

const suites = {
  admin_smoke: {
    id: 'admin_smoke',
    label: '어드민 UI 스모크',
    spec: 'cypress/live/admin-smoke.cy.ts',
    baseUrl: 'https://kscold.com',
  },
};

let currentSession = null;

function nowIso() {
  return new Date().toISOString();
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', chunk => {
      raw += chunk;
      if (raw.length > 1_000_000) {
        reject(new Error('Body too large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

function writeJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(JSON.stringify(payload));
}

function normalizeLogLine(line) {
  return line.replace(/\u001b\[[0-9;]*m/g, '').trimEnd();
}

async function listArtifacts(sessionId) {
  if (!sessionId) return [];
  const screenshotDir = path.join(ARTIFACT_ROOT, sessionId, 'screenshots');

  async function walk(relativeDir = '') {
    const dirPath = path.join(screenshotDir, relativeDir);
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    const files = [];

    for (const entry of entries) {
      const relativePath = relativeDir ? path.join(relativeDir, entry.name) : entry.name;

      if (entry.isDirectory()) {
        files.push(...(await walk(relativePath)));
        continue;
      }

      if (entry.isFile() && entry.name.endsWith('.png')) {
        files.push(relativePath);
      }
    }

    return files;
  }

  try {
    return (await walk()).sort();
  } catch {
    return [];
  }
}

async function serializeSession() {
  if (!currentSession) {
    return { session: null };
  }

  const screenshots = await listArtifacts(currentSession.id);
  const latestScreenshot = screenshots.at(-1) || null;

  return {
    session: {
      id: currentSession.id,
      suiteId: currentSession.suiteId,
      suiteLabel: currentSession.suiteLabel,
      status: currentSession.status,
      startedAt: currentSession.startedAt,
      endedAt: currentSession.endedAt,
      exitCode: currentSession.exitCode,
      logs: currentSession.logs,
      screenshots: screenshots.map(name => ({
        name,
        url: `/artifacts/${currentSession.id}/screenshots/${encodeURIComponent(name)}`,
      })),
      latestScreenshotUrl: latestScreenshot
        ? `/artifacts/${currentSession.id}/screenshots/${encodeURIComponent(latestScreenshot)}`
        : null,
    },
  };
}

async function ensureArtifactRoot() {
  await fs.mkdir(ARTIFACT_ROOT, { recursive: true });
}

async function startSession(suiteId) {
  const suite = suites[suiteId];
  if (!suite) {
    throw new Error(`Unknown suite: ${suiteId}`);
  }

  if (currentSession?.status === 'running') {
    throw new Error('A QA session is already running');
  }

  await ensureArtifactRoot();

  const sessionId = `${suiteId}-${Date.now()}`;
  const sessionRoot = path.join(ARTIFACT_ROOT, sessionId);
  const screenshotsDir = path.join(sessionRoot, 'screenshots');
  await fs.mkdir(screenshotsDir, { recursive: true });

  const args = [
    '--dir',
    BLOG_WEB_DIR,
    'exec',
    'cypress',
    'run',
    '--spec',
    suite.spec,
    '--config',
    `baseUrl=${suite.baseUrl},screenshotsFolder=${screenshotsDir},video=false`,
  ];

  const child = spawn('pnpm', args, {
    cwd: BLOG_WEB_DIR,
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: undefined,
    },
  });

  currentSession = {
    id: sessionId,
    suiteId: suite.id,
    suiteLabel: suite.label,
    status: 'running',
    startedAt: nowIso(),
    endedAt: null,
    exitCode: null,
    logs: [`[${nowIso()}] session created`, `[${nowIso()}] running suite: ${suite.label}`],
    child,
  };

  const appendLogs = chunk => {
    const lines = chunk
      .toString()
      .split(/\r?\n/)
      .map(normalizeLogLine)
      .filter(Boolean);

    if (!lines.length || !currentSession || currentSession.id !== sessionId) return;
    currentSession.logs.push(...lines);
    currentSession.logs = currentSession.logs.slice(-400);
  };

  child.stdout.on('data', appendLogs);
  child.stderr.on('data', appendLogs);

  child.on('error', error => {
    if (!currentSession || currentSession.id !== sessionId) return;
    currentSession.logs.push(`[${nowIso()}] runner error: ${error.message}`);
    currentSession.status = 'failed';
    currentSession.endedAt = nowIso();
    currentSession.exitCode = 1;
  });

  child.on('exit', code => {
    if (!currentSession || currentSession.id !== sessionId) return;
    currentSession.status = code === 0 ? 'completed' : 'failed';
    currentSession.endedAt = nowIso();
    currentSession.exitCode = code ?? 1;
    currentSession.logs.push(
      `[${nowIso()}] session finished with exit code ${currentSession.exitCode}`
    );
    currentSession.child = null;
  });
}

async function stopSession() {
  if (!currentSession || currentSession.status !== 'running' || !currentSession.child) {
    return false;
  }

  currentSession.child.kill('SIGTERM');
  currentSession.logs.push(`[${nowIso()}] stop requested by admin`);
  return true;
}

async function sendArtifact(res, sessionId, segments) {
  const safeSegments = segments.filter(Boolean).map(segment => decodeURIComponent(segment));
  const filePath = path.normalize(path.join(ARTIFACT_ROOT, sessionId, ...safeSegments));
  const sessionRoot = path.join(ARTIFACT_ROOT, sessionId);

  if (!filePath.startsWith(sessionRoot)) {
    writeJson(res, 400, { message: 'Invalid artifact path' });
    return;
  }

  try {
    const content = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const type = ext === '.png' ? 'image/png' : 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': type,
      'Cache-Control': 'no-store',
    });
    res.end(content);
  } catch {
    writeJson(res, 404, { message: 'Artifact not found' });
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host}`);

  if (req.method === 'GET' && url.pathname === '/health') {
    writeJson(res, 200, { ok: true, currentSessionId: currentSession?.id ?? null });
    return;
  }

  if (req.method === 'GET' && url.pathname === '/session') {
    writeJson(res, 200, await serializeSession());
    return;
  }

  if (req.method === 'POST' && url.pathname === '/session/start') {
    try {
      const body = await readBody(req);
      await startSession(body.suiteId || 'admin_smoke');
      writeJson(res, 201, await serializeSession());
    } catch (error) {
      writeJson(res, 409, {
        message: error instanceof Error ? error.message : 'Failed to start session',
      });
    }
    return;
  }

  if (req.method === 'POST' && url.pathname === '/session/stop') {
    const stopped = await stopSession();
    writeJson(res, 200, { stopped, ...(await serializeSession()) });
    return;
  }

  if (req.method === 'GET' && url.pathname.startsWith('/artifacts/')) {
    const parts = url.pathname.split('/').filter(Boolean);
    const [, sessionId, ...segments] = parts;
    if (!sessionId) {
      writeJson(res, 400, { message: 'Missing session id' });
      return;
    }
    await sendArtifact(res, sessionId, segments);
    return;
  }

  writeJson(res, 404, { message: 'Not found' });
});

server.listen(PORT, HOST, () => {
  console.log(`blog-qa-runner listening on http://${HOST}:${PORT}`);
  console.log(`artifacts: ${ARTIFACT_ROOT}`);
  console.log(`workspace: ${BLOG_WEB_DIR}`);
});
