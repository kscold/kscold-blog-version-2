import type { Metadata } from 'next';
import { AiAgentBloomPaymentPage } from '@/widgets/payment';

export const metadata: Metadata = {
  title: 'AI Agent Bloom 결제 미리보기',
  description: 'AI Agent Bloom 참가권 결제 화면 미리보기(관리자 전용)',
};

export default function AdminPaymentPreviewPage() {
  return <AiAgentBloomPaymentPage />;
}
