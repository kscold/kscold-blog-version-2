'use client';

import type { AiAgentBloomPayMethod } from '@/features/payment';
import { useAiAgentBloomPayment } from '@/widgets/payment/model/useAiAgentBloomPayment';
import { AiAgentBloomHeroSection } from './bloom/AiAgentBloomHeroSection';
import { AiAgentBloomProductDetailSection } from './bloom/AiAgentBloomProductDetailSection';
import { AiAgentBloomProductCheckSection } from './bloom/AiAgentBloomProductCheckSection';
import { AiAgentBloomOrdererInfoSection } from './bloom/AiAgentBloomOrdererInfoSection';
import { AiAgentBloomConfirmSection } from './bloom/AiAgentBloomConfirmSection';

interface AiAgentBloomPaymentPageProps {
  /** CARD 를 주면 KG이니시스 신용카드 결제 경로로 동작함 */
  payMethod?: AiAgentBloomPayMethod;
}

export function AiAgentBloomPaymentPage({ payMethod = 'EASY_PAY' }: AiAgentBloomPaymentPageProps) {
  const {
    form,
    errors,
    config,
    paymentStatus,
    paymentAccessToken,
    isPreparing,
    canPay,
    loginPath,
    displayConfig,
    formattedAmount,
    isCardPayment,
    updateField,
    handleSubmit,
  } = useAiAgentBloomPayment(payMethod);

  return (
    <main className="min-h-screen bg-surface-50 px-4 py-8 text-surface-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <AiAgentBloomHeroSection isCardPayment={isCardPayment} />

        <AiAgentBloomProductDetailSection
          displayConfig={displayConfig}
          formattedAmount={formattedAmount}
        />

        <AiAgentBloomProductCheckSection
          displayConfig={displayConfig}
          formattedAmount={formattedAmount}
          canPay={canPay}
          loginPath={loginPath}
        />

        <form onSubmit={handleSubmit} className="space-y-8">
          <AiAgentBloomOrdererInfoSection
            form={form}
            errors={errors}
            canPay={canPay}
            isPreparing={isPreparing}
            paymentAccessToken={paymentAccessToken}
            updateField={updateField}
            isCardPayment={isCardPayment}
          />

          <AiAgentBloomConfirmSection
            config={config}
            paymentStatus={paymentStatus}
            displayConfig={displayConfig}
            form={form}
            formattedAmount={formattedAmount}
            isPreparing={isPreparing}
            canPay={canPay}
            isCardPayment={isCardPayment}
          />
        </form>
      </div>
    </main>
  );
}
