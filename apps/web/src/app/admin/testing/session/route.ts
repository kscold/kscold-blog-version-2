import { NextRequest, NextResponse } from 'next/server';
import {
  ensureAdmin,
  fetchQaRunner,
  normalizeSessionPayload,
  runnerUnavailableResponse,
} from '../_lib';

export const dynamic = 'force-dynamic';

export async function GET() {
  const denied = await ensureAdmin();
  if (denied) return denied;

  try {
    const response = await fetchQaRunner('/session', {
      cache: 'no-store',
    });

    const data = normalizeSessionPayload(await response.json());
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return runnerUnavailableResponse(error);
  }
}

export async function POST(request: NextRequest) {
  const denied = await ensureAdmin();
  if (denied) return denied;

  try {
    const body = await request.json().catch(() => ({}));
    const response = await fetchQaRunner('/session/start', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    const data = normalizeSessionPayload(await response.json());
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return runnerUnavailableResponse(error);
  }
}
