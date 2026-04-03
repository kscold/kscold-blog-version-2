import { NextRequest, NextResponse } from 'next/server';
import { ensureAdmin, fetchQaRunner, runnerUnavailableResponse } from '../../_lib';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{
    slug: string[];
  }>;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const denied = await ensureAdmin();
  if (denied) return denied;

  try {
    const params = await context.params;
    const slug = params.slug ?? [];
    const pathname = `/artifacts/${slug.map(encodeURIComponent).join('/')}`;

    const response = await fetchQaRunner(pathname, {
      cache: 'no-store',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Artifact not found' }));
      return NextResponse.json(error, { status: response.status });
    }

    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const buffer = Buffer.from(await response.arrayBuffer());

    return new NextResponse(buffer, {
      status: response.status,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    return runnerUnavailableResponse(error);
  }
}
