'use client';

import apiClient from '@/shared/api/api-client';

const BASE_PATH = '/payments/ai-agent-bloom';
const LIVE_TEST_PATH = `${BASE_PATH}/live-test`;

export interface AiAgentBloomPaymentConfig {
  configured: boolean;
  /** 카카오페이 실연동 채널 사용 여부 */
  livePayment: boolean;
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
  payMethod: 'EASY_PAY';
  easyPayProvider: 'KAKAOPAY';
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
    apiClient.post<CompleteAiAgentBloomPaymentResponse>(`${BASE_PATH}/complete`, {
      paymentId,
      paymentAccessToken,
    }),
};

export const kakaoPayLiveTestApi = {
  getConfig: () => apiClient.get<AiAgentBloomPaymentConfig>(`${LIVE_TEST_PATH}/config`),
  prepare: (payload: PrepareAiAgentBloomPaymentPayload) =>
    apiClient.post<PreparedAiAgentBloomPayment>(`${LIVE_TEST_PATH}/prepare`, payload),
  complete: (paymentId: string) =>
    apiClient.post<CompleteAiAgentBloomPaymentResponse>(`${LIVE_TEST_PATH}/complete`, {
      paymentId,
    }),
};
