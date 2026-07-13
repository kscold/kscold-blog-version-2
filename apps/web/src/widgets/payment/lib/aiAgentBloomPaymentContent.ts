export const PRODUCT_NAME = 'AI Agent Bloom 참가권';
export const ORDER_NAME = 'AI Agent, 같이 만들고 피워보는 Bloom 참가권';
export const TOTAL_AMOUNT = 30_000;
export const PAYMENT_PATH = '/kakaopay/payment-path';

export type FormState = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
};

export type FormErrors = Partial<Record<keyof FormState, string>>;

export const initialForm: FormState = {
  customerName: '',
  customerEmail: '',
  customerPhone: '',
};

export const productHighlights = [
  '오프라인 고정 진행',
  '바이브코딩 적극 활용',
  'LangGraph 기반 AI Agent 실습',
  '장소 대관·음식/음료·강의 준비 포함',
  '결제 완료 후 즉시 참가권 확정',
];
