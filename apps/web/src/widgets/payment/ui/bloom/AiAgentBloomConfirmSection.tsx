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
}: {
  config: AiAgentBloomPaymentConfig | null;
  paymentStatus: string | null;
  displayConfig: AiAgentBloomPaymentConfig;
  form: FormState;
  formattedAmount: string;
  isPreparing: boolean;
  canPay: boolean;
}) {
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
            일반 PG 결제창 대신 카카오페이 단독연동 결제창으로 이동하기 직전 화면입니다.
            상품명, 판매자, 결제수단, 금액을 최종 확인할 수 있습니다.
          </p>
          {config && !config.configured && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold leading-6 text-amber-950">
              카카오페이 테스트 계정은 카카오페이 화면이 아니라 포트원 관리자 콘솔에서 준비합니다.
              V2 테스트 상점의 Store ID와 카카오페이 테스트 채널키를 서버 환경변수
              PORTONE_STORE_ID, PORTONE_KAKAOPAY_CHANNEL_KEY에 넣어주세요.
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
              <span className="text-sm font-black text-cyan-100">KakaoPay</span>
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
              <PaymentInfoRow label="결제수단" value="카카오페이" dark />
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
                  : '카카오페이 테스트 결제창으로 이동'
                : '로그인 또는 특별 링크가 필요합니다'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
