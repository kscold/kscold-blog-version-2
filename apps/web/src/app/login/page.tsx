import { LoginContainer } from '@/widgets/auth/ui/LoginContainer';
import { buildPageMetadata } from '@/shared/lib/seo';

export const metadata = buildPageMetadata({
  title: '로그인',
  description: '관리자 또는 사용자 계정으로 로그인하는 페이지입니다.',
  path: '/login',
  keywords: ['로그인', '관리자'],
  noIndex: true,
});

export default function LoginPage() {
  return <LoginContainer />;
}
