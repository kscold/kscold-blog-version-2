import { NextResponse } from 'next/server';
import {
  ensureAdmin,
  fetchQaRunner,
  normalizeSessionPayload,
  runnerUnavailableResponse,
} from '../../_lib';

export const dynamic = 'force-dynamic';

export async function POST() {
  const denied = await ensureAdmin();
  if (denied) return denied;

  try {
    const response = await fetchQaRunner('/session/stop', {
      method: 'POST',
      cache: 'no-store',
    });

    const data = await response.json();
    return NextResponse.json(
      {
        ...normalizeSessionPayload({ session: data.session ?? null }),
        stopped: data.stopped ?? false,
      },
      { status: response.status }
    );
  } catch (error) {
    return runnerUnavailableResponse(error);
  }
}
