'use client';

import { useKakaoPayLiveTest } from '@/widgets/payment/model/useKakaoPayLiveTest';
import { PaymentInput } from './bloom/PaymentInput';
import { PaymentInfoRow } from './bloom/PaymentInfoRow';

export function KakaoPayLiveTestPage() {
  const {
    form,
    errors,
    config,
    status,
    isProcessing,
    isAdmin,
    formattedAmount,
    updateField,
    handleSubmit,
  } = useKakaoPayLiveTest();

  return (
    <main className="min-h-screen bg-surface-50 px-4 py-8 text-surface-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="overflow-hidden rounded-[2rem] border border-surface-200 bg-white shadow-sm">
          <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
            <div className="p-6 sm:p-9 lg:p-12">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-surface-950 px-4 py-2 text-xs font-black tracking-[0.2em] text-white">
                  KAKAOPAY LIVE
                </span>
                <span className="rounded-full bg-emerald-50 px-4 py-2 text-xs font-black text-emerald-700">
                  관리자 전용
                </span>
              </div>
              <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-6xl">
                1,000원 실결제 확인
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-surface-600">
                카카오페이 실연동 채널의 승인, 서버 검증, 주문 저장 흐름을 한 번에 확인하는 관리자용
                결제 화면입니다.
              </p>
            </div>
            <aside className="bg-surface-950 p-6 text-white sm:p-9 lg:p-12">
              <p className="text-xs font-black tracking-[0.3em] text-cyan-100">REAL CHARGE</p>
              <p className="mt-4 text-5xl font-black">{formattedAmount}원</p>
              <p className="mt-5 text-sm leading-7 text-surface-300">
                결제 버튼을 누르고 카카오페이에서 승인하면 실제 1,000원이 청구됩니다. 확인이 끝난 뒤
                포트원 관리자에서 직접 취소해주세요.
              </p>
            </aside>
          </div>
        </header>

        <form
          onSubmit={handleSubmit}
          className="rounded-[2rem] border border-surface-200 bg-white p-6 shadow-sm sm:p-9 lg:p-12"
        >
          <div className="grid gap-10 lg:grid-cols-[1fr_0.9fr]">
            <section>
              <p className="text-xs font-black tracking-[0.3em] text-surface-400">ORDERER</p>
              <h2 className="mt-3 text-3xl font-black">주문자 정보</h2>
              <div className="mt-7 space-y-5">
                <PaymentInput
                  label="주문자명"
                  value={form.customerName}
                  placeholder="김승찬"
                  disabled={!isAdmin || isProcessing}
                  error={errors.customerName}
                  onChange={value => updateField('customerName', value)}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <PaymentInput
                    label="연락처"
                    value={form.customerPhone}
                    placeholder="010-0000-0000"
                    disabled={!isAdmin || isProcessing}
                    error={errors.customerPhone}
                    inputMode="numeric"
                    onChange={value => updateField('customerPhone', value)}
                  />
                  <PaymentInput
                    label="이메일"
                    value={form.customerEmail}
                    placeholder="buyer@example.com"
                    disabled={!isAdmin || isProcessing}
                    error={errors.customerEmail}
                    inputMode="email"
                    onChange={value => updateField('customerEmail', value)}
                  />
                </div>
              </div>
            </section>

            <section className="rounded-[1.75rem] border border-surface-200 bg-surface-50 p-5 sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-black tracking-[0.25em] text-surface-400">CONFIRM</p>
                  <h2 className="mt-2 text-2xl font-black">결제 정보</h2>
                </div>
                <span className="rounded-full bg-amber-300 px-4 py-2 text-xs font-black text-surface-950">
                  KakaoPay
                </span>
              </div>
              <dl className="mt-7 space-y-3 text-sm">
                <PaymentInfoRow label="판매자" value="콜딩(Colding)" />
                <PaymentInfoRow
                  label="상품명"
                  value={config?.productName ?? '카카오페이 1,000원 실결제 확인'}
                />
                <PaymentInfoRow label="결제금액" value={`${formattedAmount}원`} />
                <PaymentInfoRow label="결제수단" value="카카오페이" />
                <PaymentInfoRow
                  label="제공 기간"
                  value={config?.servicePeriod ?? '결제 완료 즉시 결제 연동 확인 서비스 제공'}
                />
              </dl>

              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold leading-6 text-red-800">
                자동 취소되지 않습니다. 승인 확인 후 포트원 결제 내역에서 직접 취소해야 합니다.
              </div>
              {status && (
                <div className="mt-4 rounded-2xl border border-cyan-200 bg-cyan-50 p-4 text-sm font-bold leading-6 text-cyan-950">
                  {status}
                </div>
              )}
              <button
                type="submit"
                disabled={!isAdmin || isProcessing || !config?.configured || !config.livePayment}
                className="mt-6 inline-flex w-full justify-center rounded-2xl bg-surface-950 px-5 py-4 text-sm font-black text-white transition hover:bg-surface-800 disabled:cursor-not-allowed disabled:bg-surface-300"
              >
                {isProcessing ? '결제 확인 중...' : '카카오페이로 실제 1,000원 결제하기'}
              </button>
            </section>
          </div>
        </form>
      </div>
    </main>
  );
}
