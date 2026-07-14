import type { Metadata } from 'next';
import { PrivacyPolicy } from '@/widgets/legal';

export const metadata: Metadata = {
  title: '개인정보 처리방침 | KSCOLD',
  description: '콜딩(Colding)의 개인정보 처리방침입니다.',
};

export default function PrivacyPolicyPage() {
  return <PrivacyPolicy />;
}
