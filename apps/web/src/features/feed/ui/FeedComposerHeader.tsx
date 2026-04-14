import type { User } from '@/types/user';

export function FeedComposerHeader({
  currentUser,
  initials,
}: {
  currentUser: User;
  initials: string;
}) {
  return (
    <div className="border-b border-surface-200 bg-surface-50/80 px-5 py-5 sm:px-6">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-surface-900 text-base font-black text-white">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-surface-400">
                SHARE A NOTE
              </p>
              <h2 className="mt-2 max-w-[18ch] text-balance text-2xl font-black tracking-tight text-surface-900 sm:max-w-[22ch] sm:text-3xl">
                {currentUser.displayName}님, 지금 하고 있는 흐름을 남겨보세요
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-surface-200 bg-white px-3 py-1 text-xs font-semibold text-surface-500">
                공개 피드
              </span>
              <span className="rounded-full border border-surface-200 bg-white px-3 py-1 text-xs font-semibold text-surface-500">
                이미지 · 링크 지원
              </span>
            </div>
          </div>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-surface-500 [overflow-wrap:anywhere]">
            짧은 메모, 작업 캡처, 참고 링크를 한 흐름으로 묶어두는 기록 공간입니다.
          </p>
        </div>
      </div>
    </div>
  );
}
