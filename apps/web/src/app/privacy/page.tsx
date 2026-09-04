import { PrivacyPolicy } from '@/widgets/legal';
import { buildPageMetadata } from '@/shared/lib/seo';

export const metadata = buildPageMetadata({
  title: '개인정보 처리방침',
  description: '콜딩(Colding)의 개인정보 처리방침입니다.',
  path: '/privacy',
  keywords: ['개인정보 처리방침', '콜딩', 'KSCOLD'],
});

export default function PrivacyPolicyPage() {
  return <PrivacyPolicy />;
}
