interface GuestbookHeroProps {
  isAuthenticated: boolean;
  totalEntries: number;
}

export function GuestbookHero({ isAuthenticated, totalEntries }: GuestbookHeroProps) {
  return (
    <section className="rounded-[2rem] border border-surface-200 bg-white px-6 py-7 shadow-sm sm:px-8">
      <p className="text-xs font-bold uppercase tracking-[0.26em] text-surface-400">
        Guestbook
      </p>
      <h1 className="mt-3 max-w-[10ch] break-keep text-[2.6rem] font-sans font-black leading-[1.05] tracking-[-0.04em] text-surface-900 sm:text-[3.2rem]">
        <span data-cy="guestbook-title">방명록을 남겨주세요!</span>
      </h1>
      <p className="mt-4 max-w-2xl break-keep text-sm leading-7 text-surface-600 sm:text-base">
        지나간 자리에서 떠오른 생각 한 줄이면 충분합니다. 짧은 인사도 좋고, 읽고 간 글에 대한 감상,
        다음에 보고 싶은 주제, 간단한 버그나 피드백을 남겨주셔도 좋아요.
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
        <div className="rounded-2xl border border-surface-200 bg-surface-50 px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-surface-400">Entries</p>
          <p className="mt-2 text-2xl font-black tracking-tight text-surface-900">{totalEntries}</p>
        </div>
        <div className="rounded-2xl border border-surface-200 bg-surface-50 px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-surface-400">Posting</p>
          <p className="mt-2 break-keep text-sm font-semibold leading-6 text-surface-800">
            {isAuthenticated ? '지금 바로 한 줄 남길 수 있어요' : '로그인하면 바로 남길 수 있어요'}
          </p>
        </div>
        <div className="rounded-2xl border border-surface-200 bg-surface-50 px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-surface-400">Feedback</p>
          <p className="mt-2 break-keep text-sm font-semibold leading-6 text-surface-800">
            간단한 버그 제보나 사용 피드백도 좋아요
          </p>
        </div>
      </div>
    </section>
  );
}
