export function AiAgentBloomHeroSection() {
  return (
    <section className="rounded-[2rem] border border-surface-200 bg-white p-5 shadow-sm sm:p-8 lg:p-10">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex rounded-full bg-surface-100 px-4 py-2 text-xs font-black uppercase tracking-[0.25em] text-surface-500">
          KakaoPay
        </span>
        <span className="inline-flex rounded-full bg-emerald-50 px-4 py-2 text-xs font-black text-emerald-700">
          카카오페이 결제
        </span>
      </div>
      <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-5xl">
        AI Agent Bloom 참가권 결제
      </h1>
      <p className="mt-4 text-sm leading-7 text-surface-600 sm:text-base">
        카카오페이 결제창에서 결제수단과 금액을 확인한 뒤 참가권을 결제할 수 있습니다.
      </p>
    </section>
  );
}
