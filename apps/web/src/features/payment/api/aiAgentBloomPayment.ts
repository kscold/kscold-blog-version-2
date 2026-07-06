'use client';

import apiClient from '@/shared/api/api-client';

const BASE_PATH = '/payments/ai-agent-bloom';

export interface AiAgentBloomPaymentConfig {
  configured: boolean;
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
    apiClient.post<CompleteAiAgentBloomPaymentResponse>(`${BASE_PATH}/complete`, { paymentId, paymentAccessToken }),
};
