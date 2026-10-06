import { NextRequest } from 'next/server';
import { jsonPost, proxySession } from '../../_lib';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  return proxySession('/session/delete', jsonPost(body));
}
