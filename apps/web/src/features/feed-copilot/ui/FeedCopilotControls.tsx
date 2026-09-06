import { FEED_INPUT_LIMITS } from '@/entities/feed';
import type { FeedCopilotStyle } from '../api/feedCopilotApi';
import { FEED_COPILOT_MEMO_MAX_LENGTH } from '../model/feedCopilotInputPolicy';
import { feedCopilotStyleOptions } from '../model/feedCopilotStyles';

interface FeedCopilotControlsProps {
  memo: string;
  onMemoChange?: (value: string) => void;
  sourceUrl: string;
  memoError: string | null;
  sourceUrlError: string | null;
  onSourceUrlChange: (value: string) => void;
  onExpandComposer?: () => void;
  styles: FeedCopilotStyle[];
  onToggleStyle: (style: FeedCopilotStyle) => void;
  onCreatePlan: () => void;
  isPlanning: boolean;
  isChat: boolean;
}

export function FeedCopilotControls({
  memo,
  onMemoChange,
  sourceUrl,
  memoError,
  sourceUrlError,
  onSourceUrlChange,
  onExpandComposer,
  styles,
  onToggleStyle,
  onCreatePlan,
  isPlanning,
  isChat,
}: FeedCopilotControlsProps) {
  return (
    <>
      {onMemoChange ? (
        <label className="block">
          <span className="text-sm font-semibold text-surface-900">공유하고 싶은 메모</span>
          <span className="mt-1 block text-sm leading-6 text-surface-500">
            생각의 조각만 적어도 됩니다. 초안은 직접 확인한 뒤에만 피드로 가져갑니다.
          </span>
          <textarea
            data-cy="feed-copilot-memo"
            value={memo}
            maxLength={FEED_COPILOT_MEMO_MAX_LENGTH}
            onChange={event => onMemoChange(event.target.value)}
            placeholder="예: 이 글을 보고 지금 만드는 Agent의 검색 흐름을 다시 생각하게 됐어요."
            rows={isChat ? 5 : 4}
            aria-invalid={Boolean(memoError)}
            aria-describedby={
              memoError ? 'feed-copilot-memo-error' : 'feed-copilot-memo-count'
            }
            className="mt-3 w-full resize-y rounded-2xl border border-surface-200 bg-white px-4 py-3 text-sm leading-6 text-surface-700 placeholder:text-surface-400 outline-none transition focus:border-surface-400 focus:ring-4 focus:ring-surface-100"
          />
          <span className="mt-2 flex items-start justify-between gap-3 text-xs">
            {memoError ? (
              <span
                id="feed-copilot-memo-error"
                role="alert"
                className="font-semibold text-red-500"
              >
                {memoError}
              </span>
            ) : null}
            <span id="feed-copilot-memo-count" className="ml-auto shrink-0 text-surface-400">
              {memo.length.toLocaleString('ko-KR')} /{' '}
              {FEED_COPILOT_MEMO_MAX_LENGTH.toLocaleString('ko-KR')}자
            </span>
          </span>
        </label>
      ) : null}

      {!onMemoChange && memoError ? (
        <p
          id="feed-copilot-memo-error"
          role="alert"
          data-cy="feed-copilot-memo-error"
          className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600"
        >
          {memoError} 피드 본문은 현재 상태로 게시할 수 있습니다.
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <label className="block">
          <span className="text-sm font-semibold text-surface-900">외부 링크</span>
          <span className="mt-1 block text-sm leading-6 text-surface-500">
            공유하고 싶은 글이 있다면 넣어주세요. Agent가 제목과 본문을 읽어 맥락으로 씁니다.
          </span>
          <input
            type="url"
            data-cy="feed-copilot-source-url"
            value={sourceUrl}
            maxLength={FEED_INPUT_LIMITS.linkUrlLength}
            onChange={event => {
              onSourceUrlChange(event.target.value);
              onExpandComposer?.();
            }}
            placeholder="https://example.com/article"
            aria-invalid={Boolean(sourceUrlError)}
            aria-describedby={
              sourceUrlError ? 'feed-copilot-link-error' : 'feed-copilot-link-count'
            }
            className="mt-3 w-full rounded-2xl border border-surface-200 bg-white px-4 py-3 text-sm text-surface-700 placeholder:text-surface-400 outline-none transition focus:border-surface-400 focus:ring-4 focus:ring-surface-100"
          />
          <span className="mt-2 flex items-start justify-between gap-3 text-xs">
            {sourceUrlError ? (
              <span
                id="feed-copilot-link-error"
                role="alert"
                className="font-semibold text-red-500"
              >
                {sourceUrlError}
              </span>
            ) : null}
            <span id="feed-copilot-link-count" className="ml-auto shrink-0 text-surface-400">
              {sourceUrl.length.toLocaleString('ko-KR')} /{' '}
              {FEED_INPUT_LIMITS.linkUrlLength.toLocaleString('ko-KR')}자
            </span>
          </span>
        </label>
        <button
          type="button"
          onClick={onCreatePlan}
          disabled={isPlanning || Boolean(memoError) || Boolean(sourceUrlError)}
          aria-describedby={memoError ? 'feed-copilot-memo-error' : undefined}
          className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-surface-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-surface-800 disabled:cursor-not-allowed disabled:opacity-55 lg:mb-0"
        >
          {isPlanning ? '계획을 정리하는 중...' : '작성 계획 세우기'}
        </button>
      </div>

      <div>
        <p className="text-sm font-semibold text-surface-900">어떤 결로 쓸까요?</p>
        <p className="mt-1 text-sm leading-6 text-surface-500">
          원하는 표현의 방향을 고르면 초안에만 반영합니다.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {feedCopilotStyleOptions.map(option => {
            const selected = styles.includes(option.id);
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onToggleStyle(option.id)}
                aria-pressed={selected}
                className={`rounded-2xl border px-3 py-2 text-left transition ${
                  selected
                    ? 'border-surface-900 bg-surface-900 text-white shadow-sm'
                    : 'border-surface-200 bg-white text-surface-500 hover:border-surface-300 hover:text-surface-700'
                }`}
              >
                <span className="block text-sm font-semibold">{option.label}</span>
                <span className="mt-0.5 block text-xs text-current/75">{option.description}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
