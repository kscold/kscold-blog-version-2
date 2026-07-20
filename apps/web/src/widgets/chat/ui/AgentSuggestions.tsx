'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface AgentSuggestionsProps {
  suggestions: string[];
  isFollowUp: boolean;
  isOpen: boolean;
  onToggle: () => void;
  onPick: (prompt: string) => void;
  disabled: boolean;
}

export function AgentSuggestions({
  suggestions,
  isFollowUp,
  isOpen,
  onToggle,
  onPick,
  disabled,
}: AgentSuggestionsProps) {
  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="mb-2.5">
      <button
        type="button"
        onClick={onToggle}
        className="mb-2 flex w-full items-center justify-between gap-2 text-surface-400 transition hover:text-surface-600"
      >
        <span className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.12em]">
          {isFollowUp ? (
            <svg
              className="h-3.5 w-3.5 text-cyan-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 3v4M3 5h4M6 17v4m-2-2h4m6-13l2.4 6.6L24 15l-6.6 2.4L15 24l-2.4-6.6L6 15l6.6-2.4L15 6z"
              />
            </svg>
          ) : (
            <svg
              className="h-3.5 w-3.5 text-amber-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          )}
          {isFollowUp ? '이어서 물어보기' : '추천 질문'}
        </span>
        <svg
          className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap gap-1.5 pb-1 sm:gap-2">
              {suggestions.map((prompt, index) => (
                <motion.button
                  key={`${isFollowUp ? 'f' : 's'}-${prompt}`}
                  type="button"
                  onClick={() => onPick(prompt)}
                  disabled={disabled}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04, duration: 0.18 }}
                  className="group inline-flex max-w-full items-center gap-1.5 rounded-full border border-surface-200 bg-surface-50 px-3 py-2 text-left text-xs font-bold text-surface-600 transition hover:border-surface-900 hover:bg-white hover:text-surface-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="truncate [overflow-wrap:anywhere]">{prompt}</span>
                  {isFollowUp && (
                    <svg
                      className="h-3 w-3 shrink-0 text-surface-300 transition-all group-hover:translate-x-0.5 group-hover:text-surface-900"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
