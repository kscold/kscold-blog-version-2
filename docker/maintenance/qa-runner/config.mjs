import { homedir } from 'node:os';
import { join } from 'node:path';

/** 어드민에서 실행할 수 있는 묶음. 스펙 경로는 Playwright 프로젝트 폴더 기준이다. */
export const SUITES = {
  admin_smoke: {
    id: 'admin_smoke',
    label: '어드민 UI 테스트 실행',
    spec: 'e2e/admin-smoke.spec.ts',
  },
};

const DEFAULT_PORT = 3305;
const DEFAULT_TIMEOUT_SECONDS = 300;
const DEFAULT_KEEP_SESSIONS = 20;

function positiveInteger(value, fallback) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

const trimSlashes = value => value.replace(/^\/+|\/+$/g, '');

/** 접속 정보가 모두 있을 때만 MinIO 보관을 켠다. 하나라도 빠지면 로컬 보관만 한다. */
function loadMinioConfig(env) {
  const endpoint = env.BLOG_QA_RUNNER_MINIO_ENDPOINT || env.MINIO_ENDPOINT || '';
  const accessKeyId = env.BLOG_QA_RUNNER_MINIO_ACCESS_KEY || env.MINIO_ACCESS_KEY || '';
  const secretAccessKey = env.BLOG_QA_RUNNER_MINIO_SECRET_KEY || env.MINIO_SECRET_KEY || '';
  if (!endpoint || !accessKeyId || !secretAccessKey) return null;
  return {
    endpoint,
    accessKeyId,
    secretAccessKey,
    bucket: env.BLOG_QA_RUNNER_MINIO_BUCKET || env.MINIO_BUCKET || 'blog',
    prefix: trimSlashes(env.BLOG_QA_RUNNER_MINIO_PREFIX || 'qa-artifacts'),
    region: env.BLOG_QA_RUNNER_MINIO_REGION || 'us-east-1',
  };
}

/**
 * 환경 변수에서 실행 설정을 읽는다.
 * 러너는 테스트를 실행하는 창구라 기본값으로는 같은 기기에서만 접속할 수 있게 연다.
 */
export function loadConfig(env, defaultWebDir) {
  const baseUrl = (env.BLOG_QA_RUNNER_BASE_URL || 'https://kscold.com').replace(/\/+$/, '');
  const stateDir = env.BLOG_QA_RUNNER_STATE_DIR || join(homedir(), '.local/state/kscold-blog-qa');
  return {
    host: env.BLOG_QA_RUNNER_HOST || '127.0.0.1',
    port: positiveInteger(env.BLOG_QA_RUNNER_PORT, DEFAULT_PORT),
    webDir: env.BLOG_QA_RUNNER_WEB_DIR || defaultWebDir,
    artifactRoot: env.BLOG_QA_RUNNER_ARTIFACT_ROOT || join(stateDir, 'artifacts'),
    baseUrl,
    authUrl: env.BLOG_QA_RUNNER_AUTH_URL || `${baseUrl}/api/auth/me`,
    runTimeoutMs:
      positiveInteger(env.BLOG_QA_RUNNER_TIMEOUT_SECONDS, DEFAULT_TIMEOUT_SECONDS) * 1000,
    keepSessions: positiveInteger(env.BLOG_QA_RUNNER_KEEP_SESSIONS, DEFAULT_KEEP_SESSIONS),
    minio: loadMinioConfig(env),
  };
}
