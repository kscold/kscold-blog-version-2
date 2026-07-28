import type { Metadata } from 'next';
import { KakaoPayLiveTestPage } from '@/widgets/payment';

export const metadata: Metadata = {
  title: '카카오페이 1,000원 실결제 확인',
  description: '관리자 전용 카카오페이 실연동 결제 확인 화면입니다.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function KakaoPayLiveTestRoute() {
  return <KakaoPayLiveTestPage />;
}
