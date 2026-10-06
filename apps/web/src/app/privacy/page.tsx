import { PrivacyPolicy } from '@/widgets/legal';
import { buildPageMetadata } from '@/shared/lib/seo';

export const metadata = buildPageMetadata({
  title: '개인정보 처리방침',
  description:
    '김승찬 블로그(kscold.com)를 운영하는 콜딩(Colding)의 개인정보 처리방침입니다. 수집하는 정보와 이용 목적, 쿠키와 광고(Google AdSense) 사용, 문의 방법을 안내합니다.',
  path: '/privacy',
  keywords: ['개인정보 처리방침', '콜딩', 'KSCOLD'],
});

export default function PrivacyPolicyPage() {
  return <PrivacyPolicy />;
}
