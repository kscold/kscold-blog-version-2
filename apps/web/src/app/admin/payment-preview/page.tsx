import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '결제 경로 캡처 | Admin',
  description: '카카오페이 결제 경로 캡처 화면',
};

const productHighlights = [
  '오프라인 고정 진행',
  '바이브코딩 적극 활용',
  'LangGraph 기반 AI Agent 실습',
  '장소 대관·음식/음료·강의 준비 포함',
];

const captureSteps = [
  {
    id: 'product-detail',
    label: '01',
    title: '상품 상세 페이지',
    description: '상품명, 참가비, 포함 항목이 한 화면에 보이도록 캡처합니다.',
  },
  {
    id: 'payment-button',
    label: '02',
    title: '결제하기 버튼',
    description: '카카오페이 결제 진입 버튼이 명확히 보이도록 캡처합니다.',
  },
  {
    id: 'before-payment-window',
    label: '03',
    title: '결제창 직전 화면',
    description: '최종 확인 정보와 결제창 진입 전 화면을 캡처합니다.',
  },
];

export default function AdminPaymentPreviewPage() {
  return (
    <main className="min-h-screen bg-surface-50 px-4 py-8 text-surface-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="overflow-hidden rounded-[2rem] border border-surface-200 bg-white shadow-sm">
          <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-8 bg-surface-950 p-6 text-white sm:p-8 lg:p-10">
              <div className="space-y-4">
                <div className="inline-flex rounded-full border border-cyan-200/30 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.35em] text-cyan-100">
                  Admin Only · KakaoPay
                </div>
                <div className="space-y-3">
                  <h1 className="text-3xl font-black tracking-tight sm:text-5xl">
                    카카오페이 결제 경로 캡처
                  </h1>
                  <p className="max-w-2xl text-sm leading-7 text-surface-300 sm:text-base">
                    상품 상세, 결제 버튼, 결제창 직전 화면을 한 번에 확인하고
                    제출용 스크린샷을 준비할 수 있는 어드민 전용 결제 경로
                    화면입니다.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {captureSteps.map((step) => (
                  <a
                    key={step.id}
                    href={`#${step.id}`}
                    className="rounded-3xl border border-white/10 bg-white/[0.06] p-4 transition hover:border-cyan-200/50 hover:bg-white/[0.1]"
                  >
                    <div className="text-xs font-black tracking-[0.3em] text-cyan-100">
                      {step.label}
                    </div>
                    <div className="mt-3 text-base font-black">{step.title}</div>
                    <p className="mt-2 text-xs leading-5 text-surface-400">
                      {step.description}
                    </p>
                  </a>
                ))}
              </div>
            </div>

            <div className="space-y-5 p-6 sm:p-8 lg:p-10">
              <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5">
                <div className="text-xs font-black uppercase tracking-[0.3em] text-amber-600">
                  Capture Guide
                </div>
                <p className="mt-3 text-sm font-bold leading-6 text-amber-950">
                  카카오페이 제출 자료에는 구매 흐름이 자연스럽게 보이는
                  화면이 도움이 됩니다. 아래 3개 영역을 순서대로 캡처하면
                  됩니다.
                </p>
              </div>
              <div className="grid gap-3 text-sm text-surface-600">
                <div className="rounded-2xl border border-surface-200 p-4">
                  <strong className="text-surface-900">상품명</strong>
                  <p className="mt-1">AI Agent Bloom 오프라인 어젠다 강의</p>
                </div>
                <div className="rounded-2xl border border-surface-200 p-4">
                  <strong className="text-surface-900">예상 참가비</strong>
                  <p className="mt-1">2만~3만 원 사이, 결제 화면 표시는 30,000원</p>
                </div>
                <div className="rounded-2xl border border-surface-200 p-4">
                  <strong className="text-surface-900">연결된 공유 페이지</strong>
                  <p className="mt-1">
                    <Link
                      href="/admin-night/ai-agent-bloom"
                      className="font-bold text-surface-900 underline underline-offset-4"
                    >
                      /admin-night/ai-agent-bloom
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="product-detail"
          className="scroll-mt-28 rounded-[2rem] border border-surface-200 bg-white p-6 shadow-sm sm:p-8 lg:p-10"
        >
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-5">
              <div className="inline-flex rounded-full bg-surface-100 px-4 py-2 text-xs font-black uppercase tracking-[0.3em] text-surface-500">
                01 · Product Detail
              </div>
              <div className="space-y-3">
                <p className="text-sm font-bold text-surface-500">오프라인 세션</p>
                <h2 className="text-3xl font-black tracking-tight sm:text-5xl">
                  AI Agent Bloom 오프라인 어젠다 강의
                </h2>
                <p className="text-base leading-8 text-surface-600">
                  LLM 호출부터 LCEL, Memory, LangGraph MAS, RAG fallback,
                  평가와 관측까지 이어지는 AI Agent 구현 흐름을 바이브코딩을
                  적극 활용해 함께 따라갑니다.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {productHighlights.map((highlight) => (
                  <span
                    key={highlight}
                    className="rounded-full border border-surface-200 px-4 py-2 text-sm font-bold text-surface-600"
                  >
                    {highlight}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-surface-200 bg-surface-50 p-5 sm:p-6">
              <div className="rounded-[1.5rem] bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-surface-400">
                      Ticket
                    </p>
                    <h3 className="mt-3 text-2xl font-black text-surface-950">
                      AI Agent Bloom 참가권
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-surface-500">
                      실제 일정 확정 후 동일한 상품 정보로 참가 안내와 결제
                      안내가 진행됩니다.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-surface-950 px-5 py-4 text-right text-white">
                    <p className="text-xs font-bold text-surface-400">결제 예정 금액</p>
                    <p className="mt-1 text-2xl font-black">30,000원</p>
                  </div>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-surface-200 p-4">
                    <p className="text-xs font-bold text-surface-400">진행 방식</p>
                    <p className="mt-1 font-black">오프라인 고정</p>
                  </div>
                  <div className="rounded-2xl border border-surface-200 p-4">
                    <p className="text-xs font-bold text-surface-400">예상 범위</p>
                    <p className="mt-1 font-black">2만~3만 원</p>
                  </div>
                  <div className="rounded-2xl border border-surface-200 p-4">
                    <p className="text-xs font-bold text-surface-400">포함 항목</p>
                    <p className="mt-1 font-black">장소·음식·강의 준비</p>
                  </div>
                  <div className="rounded-2xl border border-surface-200 p-4">
                    <p className="text-xs font-bold text-surface-400">대상</p>
                    <p className="mt-1 font-black">AI Agent 관심자</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="payment-button"
          className="scroll-mt-28 rounded-[2rem] border border-surface-200 bg-white p-6 shadow-sm sm:p-8 lg:p-10"
        >
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="space-y-4">
              <div className="inline-flex rounded-full bg-surface-100 px-4 py-2 text-xs font-black uppercase tracking-[0.3em] text-surface-500">
                02 · Payment Button
              </div>
              <h2 className="text-3xl font-black tracking-tight">결제하기 버튼</h2>
              <p className="text-sm leading-7 text-surface-600">
                버튼 문구와 결제수단이 명확히 보이도록 이 영역을 캡처하면
                됩니다. 상품명과 금액이 함께 보이도록 구성했습니다.
              </p>
            </div>

            <div className="rounded-[1.75rem] border border-surface-200 bg-surface-50 p-5">
              <div className="rounded-[1.5rem] bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-bold text-surface-500">
                      AI Agent Bloom 참가권
                    </p>
                    <p className="mt-1 text-3xl font-black text-surface-950">30,000원</p>
                  </div>
                  <button
                    type="button"
                    aria-label="카카오페이 결제하기 버튼"
                    className="w-full rounded-2xl bg-[#FEE500] px-6 py-4 text-base font-black text-[#191919] shadow-sm transition hover:brightness-95 sm:w-auto"
                  >
                    카카오페이로 결제하기
                  </button>
                </div>
                <p className="mt-4 text-xs leading-5 text-surface-400">
                  결제 전 상품명, 금액, 결제수단을 다시 확인할 수 있습니다.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section
          id="before-payment-window"
          className="scroll-mt-28 rounded-[2rem] border border-surface-200 bg-white p-6 shadow-sm sm:p-8 lg:p-10"
        >
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="space-y-4">
              <div className="inline-flex rounded-full bg-surface-100 px-4 py-2 text-xs font-black uppercase tracking-[0.3em] text-surface-500">
                03 · Before Payment Window
              </div>
              <h2 className="text-3xl font-black tracking-tight">결제창 직전 화면</h2>
              <p className="text-sm leading-7 text-surface-600">
                상품명, 판매자, 결제수단, 금액을 최종 확인하는 화면입니다.
                카카오페이 결제창으로 넘어가기 전 필요한 정보를 한 화면에
                정리했습니다.
              </p>
            </div>

            <div className="rounded-[1.75rem] bg-surface-950 p-4 shadow-sm sm:p-6">
              <div className="rounded-[1.5rem] bg-white p-5 sm:p-6">
                <div className="flex items-center justify-between gap-3 border-b border-surface-100 pb-5">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-surface-400">
                      Confirm
                    </p>
                    <h3 className="mt-2 text-2xl font-black">결제 정보 확인</h3>
                  </div>
                  <div className="rounded-full bg-[#FEE500] px-4 py-2 text-sm font-black text-[#191919]">
                    KakaoPay
                  </div>
                </div>

                <div className="divide-y divide-surface-100 text-sm">
                  <PaymentPreviewRow label="판매자" value="KSCOLD" />
                  <PaymentPreviewRow
                    label="상품명"
                    value="AI Agent Bloom 오프라인 어젠다 강의"
                  />
                  <PaymentPreviewRow label="결제수단" value="카카오페이" />
                  <PaymentPreviewRow label="결제금액" value="30,000원" strong />
                </div>

                <div className="mt-5 rounded-2xl bg-surface-50 p-4 text-xs leading-6 text-surface-500">
                  실제 일정이 확정되면 참가 안내 이메일에서 최종 장소, 시간,
                  참가비, 결제 안내를 다시 제공합니다.
                </div>

                <button
                  type="button"
                  className="mt-5 w-full rounded-2xl bg-surface-950 px-6 py-4 text-base font-black text-white"
                >
                  결제창 열기 직전
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function PaymentPreviewRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <span className="text-surface-500">{label}</span>
      <span
        className={
          strong
            ? 'text-xl font-black text-surface-950'
            : 'text-right font-bold text-surface-800'
        }
      >
        {value}
      </span>
    </div>
  );
}
