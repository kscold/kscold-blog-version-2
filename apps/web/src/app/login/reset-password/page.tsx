import { PasswordResetContainer } from '@/widgets/auth/ui/PasswordResetContainer';
import { buildPageMetadata } from '@/shared/lib/seo';

export const metadata = buildPageMetadata({
  title: '비밀번호 재설정',
  description: '메일로 전달된 안전한 링크를 사용해 새 비밀번호를 설정하는 페이지입니다.',
  path: '/login/reset-password',
  keywords: ['비밀번호 재설정', '계정 복구'],
  noIndex: true,
});

export default function PasswordResetPage() {
  return <PasswordResetContainer />;
}
