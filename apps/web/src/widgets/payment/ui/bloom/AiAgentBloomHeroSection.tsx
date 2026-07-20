export function AiAgentBloomHeroSection({ isCardPayment = false }: { isCardPayment?: boolean }) {
  return (
    <section className="rounded-[2rem] border border-surface-200 bg-white p-5 shadow-sm sm:p-8 lg:p-10">
      <div className="inline-flex rounded-full bg-surface-100 px-4 py-2 text-xs font-black uppercase tracking-[0.25em] text-surface-500">
        {isCardPayment ? 'Credit Card · KG INICIS' : 'KakaoPay'}
      </div>
      <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-5xl">
        AI Agent Bloom 참가권 결제
      </h1>
      <p className="mt-4 text-sm leading-7 text-surface-600 sm:text-base">
        {isCardPayment
          ? '신용카드(KG이니시스)로 결제합니다. 결제 완료 즉시 참가권이 확정되며, 상세 안내는 1일 이내 이메일로 제공합니다.'
          : '카카오페이로 결제합니다. 결제 완료 즉시 참가권이 확정되며, 상세 안내는 1일 이내 이메일로 제공합니다.'}
      </p>
    </section>
  );
}
