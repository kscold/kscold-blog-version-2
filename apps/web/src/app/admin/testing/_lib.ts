import { NextResponse } from 'next/server';
import { readAdminToken } from '@/shared/lib/server/adminGuard';

const QA_RUNNER_CANDIDATES = [
  process.env.BLOG_QA_RUNNER_URL,
  'http://host.docker.internal:3305',
  'http://127.0.0.1:3305',
].filter((value, index, list): value is string => Boolean(value) && list.indexOf(value) === index);
const QA_ROUTE_PREFIX = '/admin/testing';
const RUNNER_TIMEOUT_MS = 8000;

interface SessionPayload {
  session?: null | {
    screenshots: Array<{ name: string; url: string }>;
    latestScreenshotUrl: string | null;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

function toProxiedArtifactUrl(url: string | null) {
  if (!url || !url.startsWith('/artifacts/')) return url;
  return `${QA_ROUTE_PREFIX}${url}`;
}

/** 러너가 준 스크린샷 주소를 브라우저가 접근할 수 있는 어드민 경로로 바꾼다. */
function normalizeSessionPayload(payload: SessionPayload) {
  if (!payload.session) return { ...payload, session: null };

  return {
    ...payload,
    session: {
      ...payload.session,
      screenshots: payload.session.screenshots.map(screenshot => ({
        ...screenshot,
        url: toProxiedArtifactUrl(screenshot.url) || screenshot.url,
      })),
      latestScreenshotUrl: toProxiedArtifactUrl(payload.session.latestScreenshotUrl),
    },
  };
}

/** 화면이 로그인 갱신을 시도할 수 있도록, 관리자 토큰이 없거나 만료됐으면 401로 답한다. */
export function adminRequiredResponse() {
  return NextResponse.json(
    { message: '관리자 로그인이 필요합니다.', session: null },
    { status: 401 }
  );
}

export function runnerUnavailableResponse() {
  return NextResponse.json(
    {
      message: 'QA 러너에 연결하지 못했습니다. 호스트에서 러너가 실행 중인지 확인해 주세요.',
      session: null,
    },
    { status: 503 }
  );
}

/**
 * 러너를 호출한다. 러너가 백엔드에 다시 확인할 수 있게 요청한 관리자의 토큰을 함께 넘긴다.
 * 컨테이너 안과 로컬 개발 환경의 주소가 달라 후보를 차례로 시도한다.
 */
export async function fetchQaRunner(pathname: string, token: string, init: RequestInit = {}) {
  let lastError: unknown = null;

  for (const baseUrl of QA_RUNNER_CANDIDATES) {
    try {
      return await fetch(new URL(pathname, baseUrl), {
        ...init,
        cache: 'no-store',
        headers: { ...init.headers, Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(RUNNER_TIMEOUT_MS),
      });
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error('QA runner is unavailable');
}

/** 관리자 확인부터 러너 호출, 세션 응답 정리까지 세션 경로들이 함께 쓰는 흐름. */
export async function proxySession(pathname: string, init?: RequestInit) {
  const token = await readAdminToken();
  if (!token) return adminRequiredResponse();

  try {
    const response = await fetchQaRunner(pathname, token, init);
    const data: SessionPayload = await response.json();
    return NextResponse.json(normalizeSessionPayload(data), { status: response.status });
  } catch {
    return runnerUnavailableResponse();
  }
}

/** 화면이 보낸 본문을 그대로 러너에 전달하는 POST 요청 옵션. */
export function jsonPost(body: unknown): RequestInit {
  return {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}
