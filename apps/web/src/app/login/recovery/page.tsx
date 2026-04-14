import { AccountRecoveryContainer } from '@/widgets/auth/ui/AccountRecoveryContainer';
import { buildPageMetadata } from '@/shared/lib/seo';

export const metadata = buildPageMetadata({
  title: '아이디 찾기 / 비밀번호 재설정',
  description: '가입한 이메일을 기준으로 아이디 안내 또는 비밀번호 재설정 링크를 받을 수 있는 페이지입니다.',
  path: '/login/recovery',
  keywords: ['아이디 찾기', '비밀번호 재설정', '계정 복구'],
  noIndex: true,
});

export default function AccountRecoveryPage() {
  return <AccountRecoveryContainer />;
}
