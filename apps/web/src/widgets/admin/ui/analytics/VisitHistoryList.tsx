'use client';

import { motion } from 'framer-motion';
import type { VisitEntry } from '@/entities/analytics';
import { formatRelativeTime } from '@/shared/lib/format-utils';

interface Props {
  history: VisitEntry[];
  isLoading: boolean;
  loggedInOnly: boolean;
  onToggle: (value: boolean) => void;
}

export function VisitHistoryList({ history, isLoading, loggedInOnly, onToggle }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="bg-white border border-surface-200 rounded-2xl overflow-hidden"
    >
      <div className="px-5 py-4 border-b border-surface-100 flex items-center justify-between gap-3 flex-wrap">
        <h3 className="text-sm font-bold text-surface-900">방문자 히스토리</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggle(true)}
            className={`px-2.5 py-1 text-[11px] font-semibold rounded-full transition-colors ${
              loggedInOnly
                ? 'bg-surface-900 text-white'
                : 'bg-surface-100 text-surface-500 hover:text-surface-900'
            }`}
          >
            로그인 유저만
          </button>
          <button
            onClick={() => onToggle(false)}
            className={`px-2.5 py-1 text-[11px] font-semibold rounded-full transition-colors ${
              !loggedInOnly
                ? 'bg-surface-900 text-white'
                : 'bg-surface-100 text-surface-500 hover:text-surface-900'
            }`}
          >
            전체
          </button>
        </div>
      </div>
      <div className="divide-y divide-surface-50 max-h-[28rem] overflow-y-auto">
        {isLoading ? (
          <div className="p-8 animate-pulse">
            <div className="h-4 bg-surface-100 rounded mb-2" />
            <div className="h-4 bg-surface-100 rounded w-3/4" />
          </div>
        ) : history.length === 0 ? (
          <p className="text-center py-8 text-sm text-surface-400">
            {loggedInOnly ? '로그인 방문 기록이 없습니다' : '방문 기록이 없습니다'}
          </p>
        ) : (
          history.map((entry, idx) => (
            <div
              key={`${entry.visitedAt}-${idx}`}
              className="px-5 py-2.5 flex items-center gap-3 hover:bg-surface-50 transition-colors"
            >
              <span className="shrink-0 w-6 h-6 rounded-full bg-surface-100 text-[10px] font-bold text-surface-500 flex items-center justify-center">
                {(entry.username || '익').charAt(0).toUpperCase()}
              </span>
              <div className="flex-1 min-w-0 flex items-center gap-2">
                <span
                  className={`text-xs font-semibold truncate ${
                    entry.username ? 'text-surface-900' : 'text-surface-400 italic'
                  }`}
                >
                  {entry.username ?? '익명'}
                </span>
                <span className="text-surface-300">·</span>
                <code
                  className="text-xs text-surface-600 font-mono truncate"
                  title={entry.path}
                >
                  {entry.path}
                </code>
              </div>
              <span className="text-[11px] text-surface-400 tabular-nums shrink-0">
                {formatRelativeTime(entry.visitedAt)}
              </span>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}
