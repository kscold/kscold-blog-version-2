import type { Metadata } from 'next';
import { AiAgentBloomPaymentPage } from '@/widgets/payment';

export const metadata: Metadata = {
  title: 'AI Agent Bloom 테스트 결제',
  description: 'AI Agent Bloom 참가권 테스트 결제와 카카오페이 결제창 직전 확인 화면',
};

export default function KakaoPayPaymentPathPage() {
  return <AiAgentBloomPaymentPage />;
}
