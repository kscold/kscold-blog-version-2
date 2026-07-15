import type { FeedCopilotPlan } from '../api/feedCopilotApi';
import { FeedCopilotReferences } from './FeedCopilotReferences';

interface FeedCopilotPlanCardProps {
  plan: FeedCopilotPlan;
  needsRefresh: boolean;
  isDrafting: boolean;
  onCreateDraft: () => void;
}

export function FeedCopilotPlanCard({
  plan,
  needsRefresh,
  isDrafting,
  onCreateDraft,
}: FeedCopilotPlanCardProps) {
  return (
    <div className="rounded-[24px] border border-surface-200 bg-white p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-600">Plan</p>
          <h3 className="mt-2 text-lg font-bold text-surface-900">{plan.title}</h3>
          <p className="mt-2 text-sm leading-6 text-surface-600">{plan.angle}</p>
        </div>
        {needsRefresh ? (
          <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
            입력이 바뀌어 계획을 다시 만들면 좋아요
          </span>
        ) : null}
      </div>

      {plan.keyPoints.length ? (
        <ol className="mt-4 grid gap-2 sm:grid-cols-2">
          {plan.keyPoints.map((point, index) => (
            <li
              key={`${point}-${index}`}
              className="flex gap-3 rounded-2xl bg-surface-50 px-3 py-3 text-sm leading-6 text-surface-600"
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-sky-600 shadow-sm">
                {index + 1}
              </span>
              {point}
            </li>
          ))}
        </ol>
      ) : null}

      {plan.sourceSummary ? (
        <p className="mt-4 rounded-2xl border border-sky-100 bg-sky-50/70 px-4 py-3 text-sm leading-6 text-sky-800">
          {plan.sourceSummary}
        </p>
      ) : null}

      <FeedCopilotReferences references={plan.references} />

      <button
        type="button"
        onClick={onCreateDraft}
        disabled={isDrafting || needsRefresh}
        className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl border border-surface-900 bg-surface-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-surface-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isDrafting ? '초안을 쓰는 중...' : '이 방향으로 초안 만들기'}
      </button>
    </div>
  );
}
