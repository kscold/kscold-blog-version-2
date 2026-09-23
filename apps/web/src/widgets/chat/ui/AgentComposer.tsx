'use client';

import { AGENT_QUESTION_MAX_LENGTH } from '@/features/chat';

interface AgentComposerProps {
  value: string;
  disabled: boolean;
  isLoadingHistory?: boolean;
  isThinking?: boolean;
  onStop?: () => void;
  onRetry?: () => void;
  canRetry?: boolean;
  onChange: (value: string) => void;
  onSubmit: (event?: React.FormEvent) => void;
}

export function AgentComposer({
  value,
  disabled,
  isLoadingHistory = false,
  isThinking = false,
  onStop,
  onRetry,
  canRetry = false,
  onChange,
  onSubmit,
}: AgentComposerProps) {
  return (
    <div>
      {canRetry && onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mb-2 inline-flex min-h-11 items-center gap-1.5 rounded-lg px-1 py-1 text-xs font-bold text-cyan-700 transition hover:text-surface-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600"
        >
          마지막 질문 다시 보내기 <span aria-hidden="true">↻</span>
        </button>
      )}
      <form onSubmit={onSubmit} className="flex min-w-0 gap-2.5">
      <input
        type="text"
        aria-label="Agent에게 보낼 질문"
        value={value}
        maxLength={AGENT_QUESTION_MAX_LENGTH}
        onChange={e => onChange(e.target.value)}
        placeholder={
          isLoadingHistory
            ? '이전 대화를 불러오는 중입니다...'
            : '블로그·피드·Vault·Info에 대해 물어보기...'
        }
        autoComplete="off"
        className="min-w-0 flex-1 rounded-xl border border-surface-200 bg-surface-50 px-4 py-3 text-sm font-medium text-surface-900 placeholder:text-surface-400 transition-all focus:border-surface-900 focus:outline-none focus:ring-1 focus:ring-surface-900"
      />
      {isThinking && onStop ? (
        <button
          type="button"
          aria-label="Agent 답변 수신 중단"
          onClick={onStop}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-surface-300 bg-white text-surface-900 transition hover:bg-surface-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600"
        >
          <span className="h-3.5 w-3.5 rounded-sm bg-current" aria-hidden="true" />
        </button>
      ) : <button
        type="submit"
        aria-label="Agent에게 질문 보내기"
        disabled={disabled}
        className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-surface-900 text-white transition-all hover:bg-surface-800 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
          />
        </svg>
      </button>}
      </form>
    </div>
  );
}
