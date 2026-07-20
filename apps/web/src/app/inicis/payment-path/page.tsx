import type { Metadata } from 'next';
import { AiAgentBloomPaymentPage } from '@/widgets/payment';

export const metadata: Metadata = {
  title: 'AI Agent Bloom 참가권 신용카드 테스트 결제',
  description: 'AI Agent Bloom 참가권(30,000원) 신용카드(KG이니시스) 결제 연동을 확인하는 테스트 결제 화면입니다.',
  alternates: {
    canonical: '/inicis/payment-path',
  },
};

/** KG이니시스 신용카드 결제 경로. 상품 확인 → 주문자 정보 → 신용카드 → 이니시스 결제창 순으로 진행됨. */
export default function InicisPaymentPathPage() {
  return <AiAgentBloomPaymentPage payMethod="CARD" />;
}
