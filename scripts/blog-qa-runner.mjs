#!/usr/bin/env node

import http from 'node:http';
import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const BLOG_WEB_DIR = process.env.BLOG_QA_RUNNER_WEB_DIR || path.join(REPO_ROOT, 'apps', 'web');
const ARTIFACT_ROOT = process.env.BLOG_QA_RUNNER_ARTIFACT_ROOT || '/tmp/kscold-blog-qa-artifacts';
const PORT = Number(process.env.BLOG_QA_RUNNER_PORT || '3305');
const HOST = process.env.BLOG_QA_RUNNER_HOST || '0.0.0.0';
const LATEST_SESSION_MANIFEST = path.join(ARTIFACT_ROOT, 'latest-session.json');
const MINIO_ENDPOINT =
  process.env.BLOG_QA_RUNNER_MINIO_ENDPOINT ||
  process.env.MINIO_ENDPOINT ||
  process.env.MINIO_PUBLIC_URL ||
  '';
const MINIO_ACCESS_KEY =
  process.env.BLOG_QA_RUNNER_MINIO_ACCESS_KEY || process.env.MINIO_ACCESS_KEY || '';
const MINIO_SECRET_KEY =
  process.env.BLOG_QA_RUNNER_MINIO_SECRET_KEY || process.env.MINIO_SECRET_KEY || '';
const MINIO_BUCKET =
  process.env.BLOG_QA_RUNNER_MINIO_BUCKET || process.env.MINIO_BUCKET || 'blog';
const MINIO_PREFIX = trimSlashes(process.env.BLOG_QA_RUNNER_MINIO_PREFIX || 'qa-artifacts');
const MINIO_REGION = process.env.BLOG_QA_RUNNER_MINIO_REGION || 'us-east-1';
const MINIO_ENABLED = Boolean(
  MINIO_ENDPOINT && MINIO_ACCESS_KEY && MINIO_SECRET_KEY && MINIO_BUCKET
);
const minioClient = MINIO_ENABLED
  ? new S3Client({
      endpoint: MINIO_ENDPOINT,
      region: MINIO_REGION,
      forcePathStyle: true,
      credentials: {
        accessKeyId: MINIO_ACCESS_KEY,
        secretAccessKey: MINIO_SECRET_KEY,
      },
    })
  : null;

const suites = {
  admin_smoke: {
    id: 'admin_smoke',
    label: '어드민 UI 테스트 실행',
    spec: 'cypress/live/admin-smoke.cy.ts',
    baseUrl: 'https://kscold.com',
  },
};

let currentSession = null;

function trimSlashes(value) {
  return value.replace(/^\/+|\/+$/g, '');
}

function nowIso() {
  return new Date().toISOString();
}

function artifactTypeFor(fileName) {
  const ext = path.extname(fileName).toLowerCase();
  if (ext === '.png') return 'image/png';
  if (ext === '.json') return 'application/json; charset=utf-8';
  return 'application/octet-stream';
}

function normalizeArtifactPath(segments) {
  const joined = segments.filter(Boolean).map(decodeURIComponent).join('/');
  const normalized = path.posix.normalize(joined).replace(/^\/+/, '');

  if (
    !normalized ||
    normalized === '..' ||
    normalized.startsWith('../') ||
    normalized.includes('/../')
  ) {
    throw new Error('Invalid artifact path');
  }

  return normalized;
}

function buildArtifactKey(sessionId, relativePath = '') {
  const normalized = relativePath ? trimSlashes(relativePath.replaceAll('\\', '/')) : '';
  return [MINIO_PREFIX, sessionId, normalized].filter(Boolean).join('/');
}

function buildPublicSession(session, screenshotNames) {
  const latestScreenshot = screenshotNames.at(-1) || null;

  return {
    id: session.id,
    suiteId: session.suiteId,
    suiteLabel: session.suiteLabel,
    status: session.status,
    startedAt: session.startedAt,
    endedAt: session.endedAt,
    exitCode: session.exitCode,
    logs: session.logs,
    screenshots: screenshotNames.map(name => ({
      name,
      url: `/artifacts/${session.id}/screenshots/${encodeURIComponent(name)}`,
    })),
    latestScreenshotUrl: latestScreenshot
      ? `/artifacts/${session.id}/screenshots/${encodeURIComponent(latestScreenshot)}`
      : null,
  };
}

function publicSessionFromManifest(manifest) {
  return buildPublicSession(manifest, manifest.screenshotNames || []);
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

async function ensureArtifactRoot() {
  await fs.mkdir(ARTIFACT_ROOT, { recursive: true });
}

async function listLocalArtifacts(sessionId) {
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
        files.push(relativePath.replaceAll('\\', '/'));
      }
    }

    return files;
  }

  return (await walk()).sort();
}

async function listRemoteArtifacts(sessionId) {
  if (!minioClient) return [];

  const prefix = `${buildArtifactKey(sessionId, 'screenshots')}/`;
  const artifacts = [];
  let continuationToken = undefined;

  do {
    const response = await minioClient.send(
      new ListObjectsV2Command({
        Bucket: MINIO_BUCKET,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      })
    );

    for (const item of response.Contents || []) {
      if (!item.Key || !item.Key.endsWith('.png')) continue;
      artifacts.push(item.Key.slice(prefix.length));
    }

    continuationToken = response.IsTruncated ? response.NextContinuationToken : undefined;
  } while (continuationToken);

  return artifacts.sort();
}

async function listArtifacts(sessionId) {
  if (!sessionId) return [];

  try {
    const localArtifacts = await listLocalArtifacts(sessionId);
    if (localArtifacts.length) return localArtifacts;
  } catch {}

  try {
    return await listRemoteArtifacts(sessionId);
  } catch {
    return [];
  }
}

async function buildSessionManifest(session) {
  return {
    id: session.id,
    suiteId: session.suiteId,
    suiteLabel: session.suiteLabel,
    status: session.status,
    startedAt: session.startedAt,
    endedAt: session.endedAt,
    exitCode: session.exitCode,
    logs: session.logs,
    screenshotNames: await listArtifacts(session.id),
    storedAt: nowIso(),
  };
}

async function writeLatestSessionManifest(session) {
  const manifest = await buildSessionManifest(session);
  const sessionRoot = path.join(ARTIFACT_ROOT, session.id);
  const sessionManifestPath = path.join(sessionRoot, 'manifest.json');
  const rawManifest = JSON.stringify(manifest, null, 2);

  await ensureArtifactRoot();
  await fs.mkdir(sessionRoot, { recursive: true });
  await fs.writeFile(sessionManifestPath, rawManifest, 'utf8');
  await fs.writeFile(LATEST_SESSION_MANIFEST, rawManifest, 'utf8');

  if (minioClient) {
    await minioClient.send(
      new PutObjectCommand({
        Bucket: MINIO_BUCKET,
        Key: buildArtifactKey(session.id, 'manifest.json'),
        Body: rawManifest,
        ContentType: artifactTypeFor('manifest.json'),
      })
    );
  }

  return manifest;
}

async function readLatestSessionManifestLocal() {
  try {
    const rawManifest = await fs.readFile(LATEST_SESSION_MANIFEST, 'utf8');
    return JSON.parse(rawManifest);
  } catch {
    return null;
  }
}

async function readLatestSessionManifestRemote() {
  if (!minioClient) return null;

  let continuationToken = undefined;
  const manifests = [];

  do {
    const response = await minioClient.send(
      new ListObjectsV2Command({
        Bucket: MINIO_BUCKET,
        Prefix: `${MINIO_PREFIX}/`,
        ContinuationToken: continuationToken,
      })
    );

    manifests.push(
      ...(response.Contents || []).filter(item => item.Key?.endsWith('/manifest.json'))
    );

    continuationToken = response.IsTruncated ? response.NextContinuationToken : undefined;
  } while (continuationToken);

  const latestManifest = manifests.sort((a, b) => {
    const left = a.LastModified ? new Date(a.LastModified).getTime() : 0;
    const right = b.LastModified ? new Date(b.LastModified).getTime() : 0;
    return right - left;
  })[0];

  if (!latestManifest?.Key) return null;

  const response = await minioClient.send(
    new GetObjectCommand({
      Bucket: MINIO_BUCKET,
      Key: latestManifest.Key,
    })
  );
  const rawManifest = await response.Body?.transformToString();
  return rawManifest ? JSON.parse(rawManifest) : null;
}

async function readPersistedLatestSession() {
  const localManifest = await readLatestSessionManifestLocal();
  if (localManifest) return localManifest;

  try {
    return await readLatestSessionManifestRemote();
  } catch {
    return null;
  }
}

async function uploadFileToMinio(sessionId, relativePath, filePath) {
  if (!minioClient) return;

  const content = await fs.readFile(filePath);
  await minioClient.send(
    new PutObjectCommand({
      Bucket: MINIO_BUCKET,
      Key: buildArtifactKey(sessionId, relativePath),
      Body: content,
      ContentType: artifactTypeFor(filePath),
    })
  );
}

async function uploadSessionArtifacts(session) {
  if (!minioClient) return;

  const screenshotNames = await listLocalArtifacts(session.id);
  if (!screenshotNames.length) {
    session.logs.push(`[${nowIso()}] no screenshots found for upload`);
    return;
  }

  session.logs.push(
    `[${nowIso()}] uploading ${screenshotNames.length} screenshot(s) to MinIO`
  );

  for (const screenshotName of screenshotNames) {
    const localPath = path.join(ARTIFACT_ROOT, session.id, 'screenshots', screenshotName);
    await uploadFileToMinio(session.id, `screenshots/${screenshotName}`, localPath);
  }

  session.logs.push(`[${nowIso()}] MinIO upload completed`);
}

async function removeLocalSessionArtifacts(sessionId) {
  await fs.rm(path.join(ARTIFACT_ROOT, sessionId), {
    recursive: true,
    force: true,
  });
}

async function removeRemoteSessionArtifacts(sessionId) {
  if (!minioClient) return;

  let continuationToken = undefined;

  do {
    const response = await minioClient.send(
      new ListObjectsV2Command({
        Bucket: MINIO_BUCKET,
        Prefix: `${buildArtifactKey(sessionId)}/`,
        ContinuationToken: continuationToken,
      })
    );

    const objects = (response.Contents || [])
      .map(item => item.Key)
      .filter(key => Boolean(key))
      .map(Key => ({ Key }));

    if (objects.length) {
      await minioClient.send(
        new DeleteObjectsCommand({
          Bucket: MINIO_BUCKET,
          Delete: {
            Objects: objects,
            Quiet: true,
          },
        })
      );
    }

    continuationToken = response.IsTruncated ? response.NextContinuationToken : undefined;
  } while (continuationToken);
}

async function clearLatestSessionManifest(sessionId) {
  const latestManifest = await readLatestSessionManifestLocal();
  if (latestManifest?.id === sessionId) {
    await fs.rm(LATEST_SESSION_MANIFEST, { force: true });
  }
}

async function deleteSessionArtifacts(sessionId) {
  if (!sessionId) {
    throw new Error('Missing session id');
  }

  if (currentSession?.id === sessionId && currentSession.status === 'running') {
    throw new Error('실행 중인 QA 세션은 먼저 중지해야 합니다.');
  }

  await removeLocalSessionArtifacts(sessionId);
  await removeRemoteSessionArtifacts(sessionId);
  await clearLatestSessionManifest(sessionId);

  if (currentSession?.id === sessionId) {
    currentSession = null;
  }
}

async function serializeSession() {
  const manifest = currentSession
    ? await buildSessionManifest(currentSession)
    : await readPersistedLatestSession();

  if (!manifest) {
    return { session: null };
  }

  return {
    session: publicSessionFromManifest(manifest),
  };
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

  const sessionId = `${suiteId}-${Date.now()}-${randomUUID().slice(0, 8)}`;
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
  await writeLatestSessionManifest(currentSession);

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
    void writeLatestSessionManifest(currentSession);
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
    void (async () => {
      try {
        await uploadSessionArtifacts(currentSession);
        await writeLatestSessionManifest(currentSession);
      } catch (error) {
        currentSession.logs.push(
          `[${nowIso()}] artifact upload failed: ${
            error instanceof Error ? error.message : 'unknown error'
          }`
        );
        await writeLatestSessionManifest(currentSession);
      }
    })();
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
  let relativePath;
  try {
    relativePath = normalizeArtifactPath(segments);
  } catch {
    writeJson(res, 400, { message: 'Invalid artifact path' });
    return;
  }

  const filePath = path.normalize(path.join(ARTIFACT_ROOT, sessionId, relativePath));
  const sessionRoot = path.join(ARTIFACT_ROOT, sessionId);

  if (!filePath.startsWith(sessionRoot)) {
    writeJson(res, 400, { message: 'Invalid artifact path' });
    return;
  }

  try {
    const content = await fs.readFile(filePath);
    res.writeHead(200, {
      'Content-Type': artifactTypeFor(filePath),
      'Cache-Control': 'no-store',
    });
    res.end(content);
  } catch {
    if (!minioClient) {
      writeJson(res, 404, { message: 'Artifact not found' });
      return;
    }

    try {
      const artifact = await minioClient.send(
        new GetObjectCommand({
          Bucket: MINIO_BUCKET,
          Key: buildArtifactKey(sessionId, relativePath),
        })
      );
      const content = Buffer.from(await artifact.Body.transformToByteArray());
      res.writeHead(200, {
        'Content-Type': artifact.ContentType || artifactTypeFor(relativePath),
        'Cache-Control': 'no-store',
      });
      res.end(content);
    } catch {
      writeJson(res, 404, { message: 'Artifact not found' });
    }
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

  if (req.method === 'POST' && url.pathname === '/session/delete') {
    try {
      const body = await readBody(req);
      await deleteSessionArtifacts(body.sessionId);
      writeJson(res, 200, {
        deleted: true,
        ...(await serializeSession()),
      });
    } catch (error) {
      writeJson(res, 409, {
        deleted: false,
        message: error instanceof Error ? error.message : 'Failed to delete session artifacts',
        ...(await serializeSession()),
      });
    }
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
  console.log(`storage: ${minioClient ? `minio(${MINIO_BUCKET}/${MINIO_PREFIX})` : 'local'}`);
});
