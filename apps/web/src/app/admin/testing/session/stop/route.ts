import { proxySession } from '../../_lib';

export const dynamic = 'force-dynamic';

export async function POST() {
  return proxySession('/session/stop', { method: 'POST' });
}
