#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import http from 'node:http';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createAdminVerifier } from './qa-runner/auth.mjs';
import { SUITES, loadConfig } from './qa-runner/config.mjs';
import { NO_MIRROR, createMinioMirror } from './qa-runner/minio.mjs';
import { buildRun } from './qa-runner/playwright.mjs';
import { createRequestHandler } from './qa-runner/server.mjs';
import { SessionManager } from './qa-runner/sessions.mjs';

// 저장소에서 바로 띄우면 apps/web의 스펙을 쓴다. 설치본은 BLOG_QA_RUNNER_WEB_DIR로 복사해 둔 폴더를 가리킨다.
const REPOSITORY_WEB_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'apps', 'web');
const ENV_FILE = join(homedir(), '.config/kscold-blog-qa/env');
const SHUTDOWN_GRACE_MS = 3_000;

/** 보관소 접속 정보처럼 저장소에 두면 안 되는 값은 홈 디렉터리의 env 파일에서 읽는다. */
function readEnvFile(path) {
  if (!existsSync(path)) return {};
  const pairs = readFileSync(path, 'utf8')
    .split('\n')
    .map(line => /^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/.exec(line))
    .filter(Boolean)
    .map(([, name, value]) => [name, value.replace(/^['"]|['"]$/g, '')]);
  return Object.fromEntries(pairs);
}

async function openMirror(settings) {
  try {
    return await createMinioMirror(settings);
  } catch (error) {
    console.error(`MinIO 보관을 켜지 못해 로컬에만 남깁니다: ${error.message}`);
    return NO_MIRROR;
  }
}

async function main() {
  const config = loadConfig({ ...readEnvFile(ENV_FILE), ...process.env }, REPOSITORY_WEB_DIR);
  const mirror = await openMirror(config.minio);
  const sessions = new SessionManager({
    config,
    suites: SUITES,
    spawnProcess: spawn,
    buildRun,
    mirror,
  });
  const handle = createRequestHandler({
    sessions,
    verifyAdmin: createAdminVerifier({ authUrl: config.authUrl }),
    artifactRoot: config.artifactRoot,
  });

  const server = http.createServer((req, res) => {
    handle(req, res).catch(error => {
      console.error(error);
      if (!res.headersSent) res.writeHead(500);
      res.end();
    });
  });
  server.on('error', error => {
    console.error(`러너를 열지 못했습니다: ${error.message}`);
    process.exit(1);
  });
  server.listen(config.port, config.host, () => {
    console.log(`blog-qa-runner: http://${config.host}:${config.port}`);
    console.log(`대상: ${config.baseUrl} · 스펙: ${config.webDir}`);
    console.log(`결과: ${config.artifactRoot} · 보관: ${mirror.label}`);
  });

  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.on(signal, () => {
      sessions.shutdown();
      server.close(() => process.exit(0));
      setTimeout(() => process.exit(0), SHUTDOWN_GRACE_MS).unref();
    });
  }
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
