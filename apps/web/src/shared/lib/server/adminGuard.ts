import { cookies } from 'next/headers';
import { resolveInitialViewer } from '@/shared/lib/initialViewer';

/**
 * 관리자 쿠키가 있으면 그 토큰을 돌려준다.
 * 여기서는 토큰의 모양과 만료만 본다. 서명은 확인하지 않으므로, 이 토큰으로 무언가를 실행하는 쪽이
 * 백엔드에 다시 물어 진짜 관리자인지 확인해야 한다.
 */
export async function readAdminToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  return token && resolveInitialViewer(token).role === 'ADMIN' ? token : null;
}
