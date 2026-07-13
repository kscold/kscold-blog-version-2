import type { AiAgentBloomPaymentConfig } from '@/features/payment';
import { productHighlights } from '@/widgets/payment/lib/aiAgentBloomPaymentContent';
import { PaymentInfoRow } from './PaymentInfoRow';

export function AiAgentBloomProductDetailSection({
  displayConfig,
  formattedAmount,
}: {
  displayConfig: AiAgentBloomPaymentConfig;
  formattedAmount: string;
}) {
  return (
    <section
      id="product-detail"
      className="scroll-mt-28 overflow-hidden rounded-[2rem] border border-surface-200 bg-white shadow-sm"
    >
      <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-8 p-6 sm:p-8 lg:p-10">
          <div className="space-y-4">
            <div className="inline-flex rounded-full bg-surface-100 px-4 py-2 text-xs font-black uppercase tracking-[0.3em] text-surface-500">
              4-1 · Product Detail
            </div>
            <p className="text-sm font-black text-cyan-600">오프라인 세션</p>
            <h2 className="text-3xl font-black tracking-tight sm:text-5xl">
              AI Agent, 같이 만들고 피워보는 Bloom 참가권
            </h2>
            <p className="text-base leading-8 text-surface-600">
              LLM 호출부터 LCEL, Memory, LangGraph MAS, RAG fallback, 평가와 관측까지 이어지는
              AI Agent 구현 흐름을 바이브코딩을 적극 활용해 함께 따라갑니다.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {productHighlights.map((highlight) => (
              <div
                key={highlight}
                className="rounded-2xl border border-surface-200 bg-surface-50 px-4 py-3 text-sm font-bold text-surface-700"
              >
                {highlight}
              </div>
            ))}
          </div>
        </div>

        <aside className="bg-surface-950 p-6 text-white sm:p-8 lg:p-10">
          <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.06] p-5">
            <div className="text-xs font-black uppercase tracking-[0.35em] text-cyan-100">
              Ticket
            </div>
            <h3 className="mt-4 text-2xl font-black">{displayConfig.productName}</h3>
            <p className="mt-3 text-sm leading-7 text-surface-300">
              실제 일정 확정 후 동일한 상품 정보로 참가 안내와 결제 안내가 진행됩니다.
            </p>

            <div className="mt-6 space-y-3 text-sm">
              <PaymentInfoRow label="결제 예정 금액" value={`${formattedAmount}원`} dark />
              <PaymentInfoRow label="진행 방식" value="오프라인 고정" dark />
              <PaymentInfoRow label="예상 범위" value="2만~3만 원" dark />
              <PaymentInfoRow label="포함 항목" value="장소·음식·강의 준비" dark />
              <PaymentInfoRow label="서비스 제공 기간" value="결제 즉시 확정·1일 이내 안내" dark />
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
