import type { AiAgentBloomPaymentConfig } from '@/features/payment';
import type { FormState } from '@/widgets/payment/lib/aiAgentBloomPaymentContent';
import { PaymentInfoRow } from './PaymentInfoRow';

export function AiAgentBloomConfirmSection({
  config,
  paymentStatus,
  displayConfig,
  form,
  formattedAmount,
  isPreparing,
  canPay,
  isCardPayment = false,
}: {
  config: AiAgentBloomPaymentConfig | null;
  paymentStatus: string | null;
  displayConfig: AiAgentBloomPaymentConfig;
  form: FormState;
  formattedAmount: string;
  isPreparing: boolean;
  canPay: boolean;
  isCardPayment?: boolean;
}) {
  const methodLabel = isCardPayment ? '신용카드' : '카카오페이';
  const unavailable = config
    ? isCardPayment
      ? !config.cardConfigured
      : !config.configured
    : false;
  return (
    <section
      id="before-payment-window"
      className="scroll-mt-28 rounded-[2rem] border border-surface-200 bg-white p-6 shadow-sm sm:p-8 lg:p-10"
    >
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4">
          <div className="inline-flex rounded-full bg-surface-100 px-4 py-2 text-xs font-black uppercase tracking-[0.3em] text-surface-500">
            07 · Before Payment Window
          </div>
          <h2 className="text-3xl font-black tracking-tight">결제창 직전 화면</h2>
          <p className="text-sm leading-7 text-surface-600">
            {methodLabel} 결제창으로 이동하기 직전 화면입니다. 상품명, 판매자, 결제수단, 금액을 최종
            확인할 수 있습니다.
          </p>
          {unavailable && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold leading-6 text-amber-950">
              현재 {methodLabel} 결제를 이용할 수 없습니다. 잠시 후 다시 시도해주세요.
            </div>
          )}
          {paymentStatus && (
            <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-4 text-sm font-bold leading-6 text-cyan-950">
              {paymentStatus}
            </div>
          )}
        </div>

        <div className="rounded-[1.75rem] border border-surface-200 bg-surface-950 p-5 text-white">
          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-5">
            <div className="flex items-center justify-between gap-3">
              <span className="rounded-full bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.3em] text-cyan-100">
                Confirm
              </span>
              <span className="text-sm font-black text-cyan-100">
                {isCardPayment ? 'KG이니시스' : 'KakaoPay'}
              </span>
            </div>
            <h3 className="mt-5 text-2xl font-black">결제 정보 확인</h3>
            <div className="mt-5 space-y-3 text-sm">
              <PaymentInfoRow label="판매자" value="KSCOLD" dark />
              <PaymentInfoRow label="상품명" value={displayConfig.orderName} dark />
              <PaymentInfoRow
                label="주문자"
                value={`${form.customerName || '홍길동'} · ${form.customerEmail || 'buyer@example.com'}`}
                dark
              />
              <PaymentInfoRow
                label="결제수단"
                value={isCardPayment ? '신용카드 (KG이니시스)' : '카카오페이'}
                dark
              />
              <PaymentInfoRow label="결제금액" value={`${formattedAmount}원`} dark />
              <PaymentInfoRow label="서비스 제공 기간" value={displayConfig.servicePeriod} dark />
            </div>
            <p className="mt-5 text-sm leading-7 text-surface-300">
              결제 완료 즉시 참가권이 확정되며, 최종 장소와 시간 등 상세 안내는 1일 이내 이메일로 제공합니다.
              오프라인 세션은 공지된 일정에 현장에서 제공됩니다.
            </p>
            <button
              type="submit"
              disabled={isPreparing || !canPay}
              className="mt-6 inline-flex w-full justify-center rounded-2xl bg-white px-5 py-4 text-sm font-black text-surface-950 transition hover:bg-cyan-50 disabled:cursor-not-allowed disabled:bg-surface-600 disabled:text-surface-300"
            >
              {canPay
                ? isPreparing
                  ? '결제 확인 중...'
                  : `${formattedAmount}원 ${methodLabel} 테스트 결제하기`
                : '로그인 또는 안내받은 결제 링크가 필요합니다'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
