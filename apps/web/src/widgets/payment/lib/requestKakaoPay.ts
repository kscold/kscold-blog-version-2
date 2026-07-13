import type { PaymentResponse } from '@portone/browser-sdk/v2';
import type { PreparedAiAgentBloomPayment } from '@/features/payment';

export async function requestKakaoPay(
  preparedPayment: PreparedAiAgentBloomPayment
): Promise<PaymentResponse | undefined> {
  const { requestPayment } = await import('@portone/browser-sdk/v2');
  const redirectUrl = new URL(`${window.location.origin}${window.location.pathname}`);
  const token = new URLSearchParams(window.location.search).get('token')?.trim();
  if (token) {
    redirectUrl.searchParams.set('token', token);
  }

  return requestPayment({
    storeId: preparedPayment.storeId,
    channelKey: preparedPayment.channelKey,
    paymentId: preparedPayment.paymentId,
    orderName: preparedPayment.orderName,
    totalAmount: preparedPayment.totalAmount,
    currency: preparedPayment.currency,
    payMethod: 'EASY_PAY',
    easyPay: {
      easyPayProvider: 'KAKAOPAY',
      availablePayMethods: ['CARD'],
    },
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
