'use client';

import apiClient from '@/shared/api/api-client';

const BASE_PATH = '/payments/ai-agent-bloom';

/** 결제수단 — CARD 는 KG이니시스 신용카드, EASY_PAY 는 카카오페이 */
export type AiAgentBloomPayMethod = 'CARD' | 'EASY_PAY';

export interface AiAgentBloomPaymentConfig {
  configured: boolean;
  /** KG이니시스 신용카드 사용 가능 여부. false 면 카드 결제 진입 버튼을 숨김 */
  cardConfigured: boolean;
  storeId: string;
  channelKey: string;
  productName: string;
  orderName: string;
  totalAmount: number;
  currency: 'KRW';
  servicePeriod: string;
}

export interface PrepareAiAgentBloomPaymentPayload {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  paymentAccessToken?: string;
  payMethod?: AiAgentBloomPayMethod;
}

export interface PreparedAiAgentBloomPayment {
  paymentId: string;
  storeId: string;
  channelKey: string;
  programKey: string;
  productName: string;
  orderName: string;
  totalAmount: number;
  currency: 'KRW';
  payMethod: AiAgentBloomPayMethod;
  easyPayProvider: 'KAKAOPAY' | null;
  servicePeriod: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

export interface CompleteAiAgentBloomPaymentResponse {
  paymentId: string;
  status: 'READY' | 'PAID' | 'FAILED';
  portOneStatus: string;
  message: string;
}

export const aiAgentBloomPaymentApi = {
  getConfig: () => apiClient.get<AiAgentBloomPaymentConfig>(`${BASE_PATH}/config`),
  prepare: (payload: PrepareAiAgentBloomPaymentPayload) =>
    apiClient.post<PreparedAiAgentBloomPayment>(`${BASE_PATH}/prepare`, payload),
  complete: (paymentId: string, paymentAccessToken?: string) =>
    apiClient.post<CompleteAiAgentBloomPaymentResponse>(`${BASE_PATH}/complete`, { paymentId, paymentAccessToken }),
};
