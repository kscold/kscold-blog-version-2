import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '카카오페이 심사 결제 경로',
  description: '카카오페이 심사용 결제 경로, 상품 정보, 서비스 제공 기간 확인 화면',
};

const productHighlights = [
  '오프라인 고정 진행',
  '바이브코딩 적극 활용',
  'LangGraph 기반 AI Agent 실습',
  '장소 대관·음식/음료·강의 준비 포함',
  '결제 완료 후 즉시 참가권 확정',
];

const captureSteps = [
  {
    id: 'merchant-home',
    label: '01',
    title: '메인화면',
    description: '가맹점 홈페이지 메인 URL과 캡처 기준을 확인합니다.',
  },
  {
    id: 'merchant-footer',
    label: '02',
    title: '하단정보',
    description: '사업자 정보가 노출되는 푸터 위치를 확인합니다.',
  },
  {
    id: 'member-purchase',
    label: '03',
    title: '비회원 구매',
    description: '비회원 구매 가능 여부와 테스트 계정 필요 여부를 확인합니다.',
  },
  {
    id: 'product-list',
    label: '04',
    title: '주요 판매상품',
    description: '주요 판매상품이 업로드된 페이지를 캡처합니다.',
  },
  {
    id: 'product-detail',
    label: '4-1',
    title: '상품 상세 페이지',
    description: '상품명, 참가비, 포함 항목이 한 화면에 보이도록 캡처합니다.',
  },
  {
    id: 'payment-button',
    label: '05',
    title: '결제하기 버튼',
    description: '카카오페이 결제 진입 버튼이 명확히 보이도록 캡처합니다.',
  },
  {
    id: 'orderer-info',
    label: '06',
    title: '주문자 정보 입력',
    description: '이름, 이메일, 연락처를 입력한 뒤 결제수단으로 이동합니다.',
  },
  {
    id: 'before-payment-window',
    label: '07',
    title: '결제창 직전 화면',
    description: '카드 결제 선택 후 최종 확인 정보를 캡처합니다.',
  },
  {
    id: 'other-payment-types',
    label: 'N/A',
    title: '복수·정기결제',
    description: '현재 단건 결제만 운영하므로 정기결제 항목은 해당 없습니다.',
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
                  KakaoPay Review Kit
                </div>
                <div className="space-y-3">
                  <h1 className="text-3xl font-black tracking-tight sm:text-5xl">
                    카카오페이 심사 결제 경로
                  </h1>
                  <p className="max-w-2xl text-sm leading-7 text-surface-300 sm:text-base">
                    가맹점 메인, 푸터 사업자 정보, 주요 판매상품, 단건 결제
                    흐름을 한 화면에서 확인할 수 있도록 정리한 카카오페이 심사용
                    경로 화면입니다.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
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
                  첨부파일의 1~7번 기준에 맞춰 캡처할 수 있도록 구성했습니다.
                  비회원 구매가 가능한 공개 결제 경로이므로 로그인 테스트 계정은
                  별도로 필요하지 않습니다.
                </p>
              </div>
              <div className="grid gap-3 text-sm text-surface-600">
                <div className="rounded-2xl border border-surface-200 p-4">
                  <strong className="text-surface-900">상품명</strong>
                  <p className="mt-1">AI Agent, 같이 만들고 피워보는 Bloom 참가권</p>
                </div>
                <div className="rounded-2xl border border-surface-200 p-4">
                  <strong className="text-surface-900">예상 참가비</strong>
                  <p className="mt-1">2만~3만 원 사이, 결제 화면 표시는 30,000원</p>
                </div>
                <div className="rounded-2xl border border-surface-200 p-4">
                  <strong className="text-surface-900">서비스 제공 기간</strong>
                  <p className="mt-1">결제 완료 즉시 참가권 확정, 상세 안내는 1일 이내 이메일 제공</p>
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
          id="merchant-home"
          className="scroll-mt-28 rounded-[2rem] border border-surface-200 bg-white p-6 shadow-sm sm:p-8 lg:p-10"
        >
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="space-y-4">
              <div className="inline-flex rounded-full bg-surface-100 px-4 py-2 text-xs font-black uppercase tracking-[0.3em] text-surface-500">
                01 · Merchant Home
              </div>
              <h2 className="text-3xl font-black tracking-tight">가맹점 홈페이지 메인화면</h2>
              <p className="text-sm leading-7 text-surface-600">
                메인 페이지 URL과 사이트 식별 정보입니다. 카카오페이 회신 시
                메인 화면 캡처와 함께 아래 URL을 전달하면 됩니다.
              </p>
            </div>

            <div className="rounded-[1.75rem] border border-surface-200 bg-surface-50 p-5">
              <div className="rounded-[1.5rem] bg-white p-5 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.3em] text-surface-400">Homepage</p>
                <h3 className="mt-3 text-3xl font-black">KSCOLD</h3>
                <p className="mt-3 text-sm leading-7 text-surface-500">
                  지식을 기록하고, 기록을 연결하고, 연결을 공유하는 개발 블로그
                  및 오프라인 세션 안내 사이트입니다.
                </p>
                <Link
                  href="/"
                  className="mt-5 inline-flex rounded-2xl bg-surface-950 px-5 py-3 text-sm font-black text-white"
                >
                  https://kscold.com
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section
          id="merchant-footer"
          className="scroll-mt-28 rounded-[2rem] border border-surface-200 bg-white p-6 shadow-sm sm:p-8 lg:p-10"
        >
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="space-y-4">
              <div className="inline-flex rounded-full bg-surface-100 px-4 py-2 text-xs font-black uppercase tracking-[0.3em] text-surface-500">
                02 · Merchant Footer
              </div>
              <h2 className="text-3xl font-black tracking-tight">가맹점 하단 푸터정보</h2>
              <p className="text-sm leading-7 text-surface-600">
                사이트 하단 푸터에 사업자 정보가 노출됩니다. 대표전화번호는
                사업자용 공개 번호 확정 후 푸터에 추가 반영해야 합니다.
              </p>
            </div>

            <div className="rounded-[1.75rem] border border-surface-200 bg-surface-50 p-5">
              <div className="rounded-[1.5rem] bg-white p-5 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.3em] text-surface-400">Business Info</p>
                <div className="mt-4 grid gap-3 text-sm text-surface-600">
                  <PaymentPreviewRow label="상호명" value="콜딩(Colding)" />
                  <PaymentPreviewRow label="대표자명" value="김승찬" />
                  <PaymentPreviewRow label="사업장주소" value="경기도 김포시 김포한강9로75번길 66, 5층 (구래동, 국제프라자)" />
                  <PaymentPreviewRow label="사업자등록번호" value="457-49-00942" />
                  <PaymentPreviewRow label="대표이메일" value="coldingcontact@gmail.com" />
                  <PaymentPreviewRow label="대표전화번호" value="사업자용 공개 번호 확정 후 푸터 반영 필요" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="member-purchase"
          className="scroll-mt-28 rounded-[2rem] border border-surface-200 bg-white p-6 shadow-sm sm:p-8 lg:p-10"
        >
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="space-y-4">
              <div className="inline-flex rounded-full bg-surface-100 px-4 py-2 text-xs font-black uppercase tracking-[0.3em] text-surface-500">
                03 · Guest Purchase
              </div>
              <h2 className="text-3xl font-black tracking-tight">비회원 구매 가능</h2>
              <p className="text-sm leading-7 text-surface-600">
                본 결제 경로는 공개 URL에서 비회원도 확인할 수 있습니다.
                따라서 로그인 페이지 캡처와 테스트 계정 정보는 생략 가능합니다.
              </p>
            </div>

            <div className="rounded-[1.75rem] border border-emerald-200 bg-emerald-50 p-5 text-emerald-950">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-700">No Login Required</p>
              <h3 className="mt-3 text-2xl font-black">테스트 계정 제공 불필요</h3>
              <p className="mt-3 text-sm leading-7 text-emerald-800">
                결제 심사용 경로는 비회원 접근이 가능하므로 심사 담당자는 별도
                로그인 없이 상품 정보와 결제 직전 화면을 확인할 수 있습니다.
              </p>
            </div>
          </div>
        </section>

        <section
          id="product-list"
          className="scroll-mt-28 rounded-[2rem] border border-surface-200 bg-white p-6 shadow-sm sm:p-8 lg:p-10"
        >
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="space-y-4">
              <div className="inline-flex rounded-full bg-surface-100 px-4 py-2 text-xs font-black uppercase tracking-[0.3em] text-surface-500">
                04 · Product List
              </div>
              <h2 className="text-3xl font-black tracking-tight">주요 판매상품 페이지</h2>
              <p className="text-sm leading-7 text-surface-600">
                현재 판매 예정인 주요 상품은 AI Agent Bloom 단건 참가권입니다.
                아래 상품 카드와 공유 페이지를 주요 판매상품 화면으로 캡처하면 됩니다.
              </p>
            </div>

            <div className="rounded-[1.75rem] border border-surface-200 bg-surface-50 p-5">
              <div className="rounded-[1.5rem] bg-white p-5 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.3em] text-cyan-600">Single Payment Product</p>
                <h3 className="mt-3 text-2xl font-black">AI Agent, 같이 만들고 피워보는 Bloom 참가권</h3>
                <p className="mt-2 text-sm leading-7 text-surface-500">
                  오프라인 AI Agent 공유 세션 참가권입니다. 현재 결제형태는
                  정기결제가 아닌 단건 결제만 제공합니다.
                </p>
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-surface-950 px-4 py-2 text-sm font-black text-white">30,000원</span>
                  <span className="rounded-full border border-surface-200 px-4 py-2 text-sm font-bold text-surface-600">단건 결제</span>
                  <span className="rounded-full border border-surface-200 px-4 py-2 text-sm font-bold text-surface-600">오프라인 세션</span>
                </div>
                <Link
                  href="/admin-night/ai-agent-bloom"
                  className="mt-5 inline-flex rounded-2xl bg-surface-950 px-5 py-3 text-sm font-black text-white"
                >
                  상품 소개 페이지 보기
                </Link>
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
                4-1 · Product Detail
              </div>
              <div className="space-y-3">
                <p className="text-sm font-bold text-surface-500">오프라인 세션</p>
                <h2 className="text-3xl font-black tracking-tight sm:text-5xl">
                  AI Agent, 같이 만들고 피워보는 Bloom 참가권
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
                    <p className="text-xs font-bold text-surface-400">서비스 제공 기간</p>
                    <p className="mt-1 font-black">결제 즉시 확정·1일 이내 안내</p>
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
                05 · Payment Button
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
          id="orderer-info"
          className="scroll-mt-28 rounded-[2rem] border border-surface-200 bg-white p-6 shadow-sm sm:p-8 lg:p-10"
        >
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="space-y-4">
              <div className="inline-flex rounded-full bg-surface-100 px-4 py-2 text-xs font-black uppercase tracking-[0.3em] text-surface-500">
                06 · Orderer Info
              </div>
              <h2 className="text-3xl font-black tracking-tight">주문자 정보 입력</h2>
              <p className="text-sm leading-7 text-surface-600">
                임의의 주문자 정보를 입력한 뒤 결제수단 선택 단계로 넘어가는
                흐름입니다. 심사 화면에서 이름, 이메일, 연락처 입력란이 확인됩니다.
              </p>
            </div>

            <div className="rounded-[1.75rem] border border-surface-200 bg-surface-50 p-5">
              <div className="rounded-[1.5rem] bg-white p-5 shadow-sm">
                <div className="grid gap-4 sm:grid-cols-2">
                  <PaymentPreviewField label="주문자명" value="홍길동" />
                  <PaymentPreviewField label="연락처" value="010-1234-5678" />
                  <div className="sm:col-span-2">
                    <PaymentPreviewField label="이메일" value="buyer@example.com" />
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-surface-200 bg-surface-50 p-4">
                  <p className="text-xs font-bold text-surface-400">결제수단 선택</p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <div className="rounded-2xl border-2 border-surface-950 bg-white px-4 py-3">
                      <p className="text-sm font-black text-surface-950">신용/체크카드</p>
                      <p className="mt-1 text-xs text-surface-500">카카오페이 카드 결제</p>
                    </div>
                    <div className="rounded-2xl border border-surface-200 bg-white px-4 py-3">
                      <p className="text-sm font-black text-surface-600">카카오페이머니</p>
                      <p className="mt-1 text-xs text-surface-400">선택 가능 결제수단</p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="mt-5 w-full rounded-2xl bg-surface-950 px-6 py-4 text-base font-black text-white"
                >
                  주문자 정보 확인 후 결제하기
                </button>
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
                07 · Before Payment Window
              </div>
              <h2 className="text-3xl font-black tracking-tight">결제창 직전 화면</h2>
              <p className="text-sm leading-7 text-surface-600">
                일반 PG 결제창 대신 카카오페이 단독연동 결제창으로 이동하기
                직전 화면입니다. 상품명, 판매자, 결제수단, 금액을 최종 확인할
                수 있습니다.
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
                    value="AI Agent, 같이 만들고 피워보는 Bloom 참가권"
                  />
                  <PaymentPreviewRow label="주문자" value="홍길동 · buyer@example.com" />
                  <PaymentPreviewRow label="결제수단" value="신용/체크카드 · 카카오페이" />
                  <PaymentPreviewRow label="결제금액" value="30,000원" strong />
                  <PaymentPreviewRow label="서비스 제공 기간" value="결제 완료 즉시 참가권 확정, 상세 안내 1일 이내 이메일 제공" />
                </div>

                <div className="mt-5 rounded-2xl bg-surface-50 p-4 text-xs leading-6 text-surface-500">
                  결제 완료 즉시 참가권이 확정되며, 최종 장소와 시간 등 상세
                  안내는 1일 이내 이메일로 제공합니다. 오프라인 세션은 공지된
                  일정에 현장에서 제공됩니다.
                </div>

                <button
                  type="button"
                  className="mt-5 w-full rounded-2xl bg-surface-950 px-6 py-4 text-base font-black text-white"
                >
                  카카오페이 카드 결제창으로 이동
                </button>
              </div>
            </div>
          </div>
        </section>

        <section
          id="other-payment-types"
          className="scroll-mt-28 rounded-[2rem] border border-surface-200 bg-white p-6 shadow-sm sm:p-8 lg:p-10"
        >
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="space-y-4">
              <div className="inline-flex rounded-full bg-surface-100 px-4 py-2 text-xs font-black uppercase tracking-[0.3em] text-surface-500">
                N/A · Other Payment Types
              </div>
              <h2 className="text-3xl font-black tracking-tight">복수 결제형태 및 정기결제 해당 없음</h2>
              <p className="text-sm leading-7 text-surface-600">
                현재 운영 예정 상품은 AI Agent Bloom 참가권 단건 결제 하나입니다.
                대표/정기 등 복수 결제형태와 정기결제 상품은 운영하지 않습니다.
              </p>
            </div>

            <div className="rounded-[1.75rem] border border-surface-200 bg-surface-50 p-5">
              <div className="rounded-[1.5rem] bg-white p-5 shadow-sm">
                <PaymentPreviewRow label="결제형태" value="단건 결제" />
                <PaymentPreviewRow label="정기결제" value="운영하지 않음" />
                <PaymentPreviewRow label="추가 상품" value="현재 없음" />
                <PaymentPreviewRow label="심사 적용" value="4~5번 단건 결제 항목으로 확인 가능" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function PaymentPreviewField({ label, value }: { label: string; value: string }) {
  return (
    <label className="block">
      <span className="text-xs font-bold text-surface-400">{label}</span>
      <input
        readOnly
        value={value}
        className="mt-2 w-full rounded-2xl border border-surface-200 bg-surface-50 px-4 py-3 text-sm font-bold text-surface-900 outline-none"
      />
    </label>
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
