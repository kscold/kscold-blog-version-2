import type { FeedCopilotDraft } from '../api/feedCopilotApi';
import { FeedCopilotReferences } from './FeedCopilotReferences';

interface FeedCopilotDraftCardProps {
  draft: FeedCopilotDraft;
  onApply: () => void;
}

export function FeedCopilotDraftCard({ draft, onApply }: FeedCopilotDraftCardProps) {
  return (
    <div className="rounded-[24px] border border-emerald-100 bg-emerald-50/50 p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Draft</p>
          <h3 className="mt-2 text-lg font-bold text-surface-900">{draft.title}</h3>
        </div>
        <button
          type="button"
          onClick={onApply}
          className="inline-flex min-h-10 items-center justify-center rounded-xl bg-emerald-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-800"
        >
          본문에 적용하기
        </button>
      </div>
      <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-surface-700">
        {draft.content}
      </p>
      {draft.tags.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {draft.tags.map(tag => (
            <span
              key={tag}
              className="rounded-full border border-emerald-100 bg-white px-3 py-1 text-xs font-semibold text-emerald-700"
            >
              #{tag}
            </span>
          ))}
        </div>
      ) : null}
      <FeedCopilotReferences references={draft.references} />
      <p className="mt-4 text-xs leading-5 text-surface-500">
        AI 초안은 자동으로 게시되지 않습니다. 본문에 적용한 뒤 사실과 표현을 직접 확인해주세요.
      </p>
    </div>
  );
}
