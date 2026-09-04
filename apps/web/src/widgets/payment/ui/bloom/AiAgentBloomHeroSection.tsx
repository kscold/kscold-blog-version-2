export function AiAgentBloomHeroSection({
  livePayment = false,
}: {
  livePayment?: boolean;
}) {
  return (
    <section className="rounded-[2rem] border border-surface-200 bg-white p-5 shadow-sm sm:p-8 lg:p-10">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex rounded-full bg-surface-100 px-4 py-2 text-xs font-black uppercase tracking-[0.25em] text-surface-500">
          KakaoPay
        </span>
        <span
          className={`inline-flex rounded-full px-4 py-2 text-xs font-black ${
            livePayment ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-100 text-amber-800'
          }`}
        >
          {livePayment ? '실시간 결제' : '테스트 결제'}
        </span>
      </div>
      <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-5xl">
        AI Agent Bloom 참가권 {livePayment ? '결제' : '테스트 결제'}
      </h1>
      <p className="mt-4 text-sm leading-7 text-surface-600 sm:text-base">
        {livePayment
          ? '카카오페이 결제창에서 결제수단과 금액을 확인한 뒤 참가권을 결제할 수 있습니다.'
          : '카카오페이 결제창 연동을 확인하는 테스트 결제 화면입니다. 결제대행사 테스트 모드로 동작하므로 실제 승인이나 청구는 발생하지 않습니다.'}
      </p>
    </section>
  );
}
