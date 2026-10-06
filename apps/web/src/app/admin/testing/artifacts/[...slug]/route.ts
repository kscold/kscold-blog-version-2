import { NextRequest, NextResponse } from 'next/server';
import { readAdminToken } from '@/shared/lib/server/adminGuard';
import { adminRequiredResponse, fetchQaRunner, runnerUnavailableResponse } from '../../_lib';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{
    slug: string[];
  }>;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const token = await readAdminToken();
  if (!token) return adminRequiredResponse();

  try {
    const { slug = [] } = await context.params;
    const response = await fetchQaRunner(
      `/artifacts/${slug.map(encodeURIComponent).join('/')}`,
      token
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: '스크린샷을 찾지 못했습니다.' }));
      return NextResponse.json(error, { status: response.status });
    }

    return new NextResponse(Buffer.from(await response.arrayBuffer()), {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/octet-stream',
        'Cache-Control': 'no-store',
      },
    });
  } catch {
    return runnerUnavailableResponse();
  }
}
