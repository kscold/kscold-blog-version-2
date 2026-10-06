import { NextRequest } from 'next/server';
import { jsonPost, proxySession } from '../_lib';

export const dynamic = 'force-dynamic';

export async function GET() {
  return proxySession('/session');
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  return proxySession('/session/start', jsonPost(body));
}
