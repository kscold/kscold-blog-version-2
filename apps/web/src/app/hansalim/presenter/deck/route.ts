import { NextResponse } from 'next/server';
import { isVerifiedAdmin } from '@/shared/lib/server/adminGuard';
import { readPresenterDeck } from '@/widgets/lecture/server/hansalimPresenter';

export const dynamic = 'force-dynamic';

// 강사용 PDF(답·대본 장 포함)는 관리자에게만 내준다. 브라우저·중간 캐시에 남기지 않는다.
export async function GET() {
  if (!(await isVerifiedAdmin())) {
    return NextResponse.json({ message: '관리자 로그인이 필요합니다.' }, { status: 401 });
  }
  const deck = await readPresenterDeck();
  if (!deck) return NextResponse.json({ message: '발표 자료가 없습니다.' }, { status: 404 });
  return new NextResponse(new Uint8Array(deck), {
    headers: {
      'Content-Type': 'application/pdf',
      'Cache-Control': 'private, no-store',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
}
