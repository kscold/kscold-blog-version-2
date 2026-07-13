'use client';

import { useAiAgentBloomPayment } from '@/widgets/payment/model/useAiAgentBloomPayment';
import { AiAgentBloomHeroSection } from './bloom/AiAgentBloomHeroSection';
import { AiAgentBloomProductDetailSection } from './bloom/AiAgentBloomProductDetailSection';
import { AiAgentBloomProductCheckSection } from './bloom/AiAgentBloomProductCheckSection';
import { AiAgentBloomOrdererInfoSection } from './bloom/AiAgentBloomOrdererInfoSection';
import { AiAgentBloomConfirmSection } from './bloom/AiAgentBloomConfirmSection';

export function AiAgentBloomPaymentPage() {
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
    updateField,
    handleSubmit,
  } = useAiAgentBloomPayment();

  return (
    <main className="min-h-screen bg-surface-50 px-4 py-8 text-surface-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <AiAgentBloomHeroSection />

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
          />

          <AiAgentBloomConfirmSection
            config={config}
            paymentStatus={paymentStatus}
            displayConfig={displayConfig}
            form={form}
            formattedAmount={formattedAmount}
            isPreparing={isPreparing}
            canPay={canPay}
          />
        </form>
      </div>
    </main>
  );
}
