import type { PaymentResponse } from '@portone/browser-sdk/v2';
import type { PreparedAiAgentBloomPayment } from '@/features/payment';

/**
 * 포트원 결제창을 연다. payMethod 가 CARD 면 KG이니시스 신용카드 결제창이, EASY_PAY 면 카카오페이
 * 결제창이 호출됨. 채널키·결제수단은 서버(prepare 응답)가 결정하므로 클라이언트는 그대로 전달만 함.
 */
export async function requestPortOnePayment(
  preparedPayment: PreparedAiAgentBloomPayment
): Promise<PaymentResponse | undefined> {
  const { requestPayment } = await import('@portone/browser-sdk/v2');
  const redirectUrl = new URL(`${window.location.origin}${window.location.pathname}`);
  const token = new URLSearchParams(window.location.search).get('token')?.trim();
  if (token) {
    redirectUrl.searchParams.set('token', token);
  }

  const isCard = preparedPayment.payMethod === 'CARD';

  return requestPayment({
    storeId: preparedPayment.storeId,
    channelKey: preparedPayment.channelKey,
    paymentId: preparedPayment.paymentId,
    orderName: preparedPayment.orderName,
    totalAmount: preparedPayment.totalAmount,
    currency: preparedPayment.currency,
    ...(isCard
      ? { payMethod: 'CARD' as const }
      : {
          payMethod: 'EASY_PAY' as const,
          easyPay: {
            easyPayProvider: 'KAKAOPAY' as const,
            availablePayMethods: ['CARD' as const],
          },
        }),
    customer: {
      fullName: preparedPayment.customerName,
      email: preparedPayment.customerEmail,
      phoneNumber: preparedPayment.customerPhone.replace(/\D/g, ''),
    },
    products: [
      {
        id: 'ai-agent-bloom-ticket',
        name: preparedPayment.productName,
        amount: preparedPayment.totalAmount,
        quantity: 1,
        tag: 'offline-session',
        link: `${window.location.origin}/admin-night/ai-agent-bloom`,
        description: preparedPayment.servicePeriod,
      },
    ],
    productType: 'DIGITAL',
    redirectUrl: redirectUrl.toString(),
    customData: {
      programKey: preparedPayment.programKey,
      servicePeriod: preparedPayment.servicePeriod,
    },
  });
}
