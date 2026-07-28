import type { Metadata } from 'next';
import { AiAgentBloomPaymentPage } from '@/widgets/payment';

export const metadata: Metadata = {
  title: 'AI Agent Bloom 참가권 카카오페이 결제',
  description: 'AI Agent Bloom 참가권(30,000원)을 카카오페이로 결제하는 화면입니다.',
};

export default function KakaoPayPaymentPathPage() {
  return <AiAgentBloomPaymentPage />;
}
