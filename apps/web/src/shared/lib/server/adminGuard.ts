import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { resolveInitialViewer } from '@/shared/lib/initialViewer';

export async function denyUnlessAdmin() {
  const cookieStore = await cookies();
  const viewer = resolveInitialViewer(cookieStore.get('auth-token')?.value);

  if (viewer.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Admin only' }, { status: 403 });
  }

  return null;
}
