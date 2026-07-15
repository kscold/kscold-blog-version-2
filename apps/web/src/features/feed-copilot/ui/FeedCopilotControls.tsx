import type { FeedCopilotStyle } from '../api/feedCopilotApi';
import { feedCopilotStyleOptions } from '../model/feedCopilotStyles';

interface FeedCopilotControlsProps {
  memo: string;
  onMemoChange?: (value: string) => void;
  sourceUrl: string;
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
            value={memo}
            onChange={event => onMemoChange(event.target.value)}
            placeholder="예: 이 글을 보고 지금 만드는 Agent의 검색 흐름을 다시 생각하게 됐어요."
            rows={isChat ? 5 : 4}
            className="mt-3 w-full resize-y rounded-2xl border border-surface-200 bg-white px-4 py-3 text-sm leading-6 text-surface-700 placeholder:text-surface-400 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-50"
          />
        </label>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <label className="block">
          <span className="text-sm font-semibold text-surface-900">외부 링크</span>
          <span className="mt-1 block text-sm leading-6 text-surface-500">
            공유하고 싶은 글이 있다면 넣어주세요. Agent가 제목과 본문을 읽어 맥락으로 씁니다.
          </span>
          <input
            type="url"
            value={sourceUrl}
            onChange={event => {
              onSourceUrlChange(event.target.value);
              onExpandComposer?.();
            }}
            placeholder="https://example.com/article"
            className="mt-3 w-full rounded-2xl border border-surface-200 bg-white px-4 py-3 text-sm text-surface-700 placeholder:text-surface-400 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-50"
          />
        </label>
        <button
          type="button"
          onClick={onCreatePlan}
          disabled={isPlanning}
          className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-surface-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-surface-800 disabled:cursor-not-allowed disabled:opacity-55 lg:mb-0"
        >
          {isPlanning ? '계획을 정리하는 중...' : '작성 계획 세우기'}
        </button>
      </div>

      <div>
        <p className="text-sm font-semibold text-surface-900">어떤 톤으로 쓸까요?</p>
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
                    ? 'border-sky-300 bg-sky-50 text-sky-800 shadow-sm'
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
