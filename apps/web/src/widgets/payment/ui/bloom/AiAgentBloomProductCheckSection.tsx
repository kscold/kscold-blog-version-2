import Link from 'next/link';
import type { AiAgentBloomPaymentConfig } from '@/features/payment/api/aiAgentBloomPayment';

export function AiAgentBloomProductCheckSection({
  displayConfig,
  formattedAmount,
  canPay,
  loginPath,
}: {
  displayConfig: AiAgentBloomPaymentConfig;
  formattedAmount: string;
  canPay: boolean;
  loginPath: string;
}) {
  return (
    <section
      id="payment-button"
      className="scroll-mt-28 rounded-[2rem] border border-surface-200 bg-white p-6 shadow-sm sm:p-8 lg:p-10"
    >
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4">
          <div className="inline-flex rounded-full bg-surface-100 px-4 py-2 text-xs font-black uppercase tracking-[0.3em] text-surface-500">
            05 · Product Check
          </div>
          <h2 className="text-3xl font-black tracking-tight">상품 확인</h2>
          <p className="text-sm leading-7 text-surface-600">
            결제 전에 상품명, 결제 예정 금액, 제공 기간을 먼저 확인합니다.
            실제 카카오페이 결제창 호출 버튼은 마지막 결제 정보 확인 화면에만 둡니다.
          </p>
        </div>

        <div className="rounded-[1.75rem] border border-surface-200 bg-surface-50 p-5">
          <div className="rounded-[1.5rem] bg-white p-5 shadow-sm">
            <p className="text-sm font-black text-surface-500">{displayConfig.productName}</p>
            <p className="mt-2 text-4xl font-black tracking-tight">{formattedAmount}원</p>
            {canPay ? (
              <a
                href="#orderer-info"
                className="mt-5 inline-flex w-full justify-center rounded-2xl bg-surface-950 px-5 py-4 text-sm font-black text-white transition hover:bg-surface-800"
              >
                주문자 정보 입력하기
              </a>
            ) : (
              <Link
                href={loginPath}
                className="mt-5 inline-flex w-full justify-center rounded-2xl bg-surface-950 px-5 py-4 text-sm font-black text-white transition hover:bg-surface-800"
              >
                로그인하고 결제하기
              </Link>
            )}
            <p className="mt-3 text-xs font-bold text-surface-500">
              테스트 결제는 주문자 정보 입력 후 카카오페이 단독 결제창으로 이어집니다.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
