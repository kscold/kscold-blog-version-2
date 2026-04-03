import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { resolveInitialViewer } from '@/shared/lib/initialViewer';

const QA_RUNNER_CANDIDATES = [
  process.env.BLOG_QA_RUNNER_URL,
  'http://host.docker.internal:3305',
  'http://127.0.0.1:3305',
].filter((value, index, list): value is string => Boolean(value) && list.indexOf(value) === index);
const QA_ROUTE_PREFIX = '/admin/testing';

export async function ensureAdmin() {
  const cookieStore = await cookies();
  const viewer = resolveInitialViewer(cookieStore.get('auth-token')?.value);

  if (viewer.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Admin only' }, { status: 403 });
  }

  return null;
}

export function toProxiedArtifactUrl(url: string | null) {
  if (!url) return null;
  if (!url.startsWith('/artifacts/')) return url;
  return `${QA_ROUTE_PREFIX}${url}`;
}

interface SessionPayload {
  session: null | {
    id: string;
    suiteId: string;
    suiteLabel: string;
    status: string;
    startedAt: string | null;
    endedAt: string | null;
    exitCode: number | null;
    logs: string[];
    screenshots: Array<{
      name: string;
      url: string;
    }>;
    latestScreenshotUrl: string | null;
  };
}

export function normalizeSessionPayload(payload: SessionPayload): SessionPayload {
  if (!payload.session) {
    return payload;
  }

  return {
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

export function runnerUnavailableResponse(error: unknown) {
  const message =
    error instanceof Error ? error.message : 'QA runner is unavailable';

  return NextResponse.json(
    {
      message,
      session: null,
    },
    { status: 503 }
  );
}

export async function fetchQaRunner(pathname: string, init?: RequestInit) {
  let lastError: unknown = null;

  for (const baseUrl of QA_RUNNER_CANDIDATES) {
    try {
      return await fetch(new URL(pathname, baseUrl), init);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error('QA runner is unavailable');
}
