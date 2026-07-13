import type { FormErrors, FormState } from '@/widgets/payment/lib/aiAgentBloomPaymentContent';
import { PaymentInput } from './PaymentInput';

export function AiAgentBloomOrdererInfoSection({
  form,
  errors,
  canPay,
  isPreparing,
  paymentAccessToken,
  updateField,
}: {
  form: FormState;
  errors: FormErrors;
  canPay: boolean;
  isPreparing: boolean;
  paymentAccessToken: string | undefined;
  updateField: (field: keyof FormState, value: string) => void;
}) {
  return (
    <section
      id="orderer-info"
      className="scroll-mt-28 rounded-[2rem] border border-surface-200 bg-white p-6 shadow-sm sm:p-8 lg:p-10"
    >
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4">
          <div className="inline-flex rounded-full bg-surface-100 px-4 py-2 text-xs font-black uppercase tracking-[0.3em] text-surface-500">
            06 · Orderer Info
          </div>
          <h2 className="text-3xl font-black tracking-tight">주문자 정보 입력</h2>
          <p className="text-sm leading-7 text-surface-600">
            임의의 주문자 정보를 입력한 뒤 결제수단 선택 단계로 넘어가는 흐름입니다.
            심사 화면에서 이름, 이메일, 연락처 입력란이 확인됩니다.
          </p>
          {!canPay && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold leading-6 text-amber-900">
              일반 결제는 로그인 후 진행됩니다. 신청자에게 발송된 특별 링크로 접속한 경우에는 로그인 없이 결제할 수 있습니다.
            </div>
          )}
          {paymentAccessToken && (
            <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-4 text-sm font-bold leading-6 text-cyan-950">
              특별 결제 링크로 접속했습니다. 주문자 정보만 확인하면 바로 카카오페이 결제창으로 이동할 수 있습니다.
            </div>
          )}
        </div>

        <div className="space-y-5 rounded-[1.75rem] border border-surface-200 bg-surface-50 p-5">
          <PaymentInput
            label="주문자명"
            value={form.customerName}
            placeholder="홍길동"
            disabled={!canPay || isPreparing}
            error={errors.customerName}
            onChange={(value) => updateField('customerName', value)}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <PaymentInput
              label="연락처"
              value={form.customerPhone}
              placeholder="010-1234-5678"
              disabled={!canPay || isPreparing}
              error={errors.customerPhone}
              inputMode="numeric"
              onChange={(value) => updateField('customerPhone', value)}
            />
            <PaymentInput
              label="이메일"
              value={form.customerEmail}
              placeholder="buyer@example.com"
              disabled={!canPay || isPreparing}
              error={errors.customerEmail}
              inputMode="email"
              onChange={(value) => updateField('customerEmail', value)}
            />
          </div>

          <div>
            <div className="text-sm font-black text-surface-900">결제수단 선택</div>
            <div className="mt-3">
              <div className="rounded-2xl border-2 border-surface-950 bg-white p-4 text-sm font-black text-surface-900">
                카카오페이
                <p className="mt-1 text-xs font-bold text-surface-500">
                  테스트 결제는 카카오페이 단독 결제창으로만 진행합니다.
                </p>
              </div>
            </div>
            <p className="mt-2 text-xs font-bold text-surface-500">현재 결제수단: 카카오페이 고정</p>
          </div>
        </div>
      </div>
    </section>
  );
}
