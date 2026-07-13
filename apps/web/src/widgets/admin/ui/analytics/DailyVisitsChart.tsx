'use client';

import { motion } from 'framer-motion';
import type { DailyStat } from '@/entities/analytics/api/useAnalytics';

interface Props {
  daily: DailyStat[];
  isLoading: boolean;
}

export function DailyVisitsChart({ daily, isLoading }: Props) {
  const maxVisits = Math.max(...daily.map(d => d.visits), 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-surface-200 rounded-2xl p-5"
    >
      <h3 className="text-sm font-bold text-surface-900 mb-4">일별 방문 추이</h3>
      {isLoading ? (
        <div className="h-20 animate-pulse bg-surface-100 rounded" />
      ) : daily.length === 0 ? (
        <p className="text-sm text-surface-400 py-6 text-center">데이터가 없습니다</p>
      ) : (
        <div className="flex items-end gap-1" style={{ height: 96 }}>
          {daily.map(d => (
            <div key={d.date} className="flex flex-col items-center gap-1 flex-1 min-w-0">
              <span className="text-[9px] font-bold text-surface-700 tabular-nums leading-none">
                {d.visits > 0 ? d.visits : ''}
              </span>
              <div className="w-full bg-surface-100 rounded-sm overflow-hidden flex-1">
                <div
                  className="w-full bg-surface-800 rounded-sm transition-all duration-500"
                  style={{
                    height: `${Math.round((d.visits / maxVisits) * 100)}%`,
                    minHeight: d.visits > 0 ? 3 : 0,
                  }}
                />
              </div>
              <span className="text-[9px] text-surface-400 leading-none">
                {d.date.slice(5)}
              </span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
