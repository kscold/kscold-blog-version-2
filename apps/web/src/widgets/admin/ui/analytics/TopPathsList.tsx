'use client';

import { motion } from 'framer-motion';
import type { PathStat } from '@/entities/analytics/api/useAnalytics';

interface Props {
  topPaths: PathStat[];
  isLoading: boolean;
}

export function TopPathsList({ topPaths, isLoading }: Props) {
  const maxPathVisits = topPaths[0]?.visits ?? 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white border border-surface-200 rounded-2xl overflow-hidden"
    >
      <div className="px-5 py-4 border-b border-surface-100 flex items-center justify-between">
        <h3 className="text-sm font-bold text-surface-900">인기 페이지</h3>
        <span className="text-xs text-surface-400">방문수 · 고유 방문자</span>
      </div>
      <div className="divide-y divide-surface-50">
        {isLoading ? (
          <div className="p-8 animate-pulse">
            <div className="h-4 bg-surface-100 rounded mb-2" />
            <div className="h-4 bg-surface-100 rounded w-3/4" />
          </div>
        ) : topPaths.length === 0 ? (
          <p className="text-center py-8 text-sm text-surface-400">데이터가 없습니다</p>
        ) : (
          topPaths.map((p, idx) => (
            <div key={p.path} className="px-5 py-3">
              <div className="flex items-center gap-3 mb-1.5">
                <span className="text-xs font-bold text-surface-400 tabular-nums w-5">
                  {idx + 1}
                </span>
                <code className="text-xs text-surface-800 font-mono truncate flex-1" title={p.path}>
                  {p.path}
                </code>
                <span className="text-xs text-surface-500 tabular-nums shrink-0">
                  {p.visits.toLocaleString()} · {p.uniqueVisitors.toLocaleString()}
                </span>
              </div>
              <div className="ml-8 h-1 bg-surface-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-surface-700 rounded-full transition-all duration-500"
                  style={{ width: `${(p.visits / maxPathVisits) * 100}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}
