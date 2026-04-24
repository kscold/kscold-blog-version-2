'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useDailyVisits, useTopPaths, useVisitHistory } from '@/entities/analytics/api/useAnalytics';

type Window = 7 | 14 | 30;

export function AdminPageVisitSection() {
  const [window, setWindow] = useState<Window>(7);
  const [loggedInOnly, setLoggedInOnly] = useState(true);
  const { data: daily = [], isLoading: dailyLoading } = useDailyVisits(window);
  const { data: topPaths = [], isLoading: pathsLoading } = useTopPaths(window, 15);
  const { data: history = [], isLoading: historyLoading } = useVisitHistory({ loggedInOnly, limit: 80 });

  const maxVisits = Math.max(...daily.map(d => d.visits), 1);
  const totalVisits = daily.reduce((sum, d) => sum + d.visits, 0);
  const maxPathVisits = topPaths[0]?.visits ?? 1;

  return (
    <div className="space-y-4">
      {/* 기간 선택 */}
      <div className="flex items-center gap-2">
        {([7, 14, 30] as const).map(w => (
          <button
            key={w}
            onClick={() => setWindow(w)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-colors ${
              window === w
                ? 'bg-surface-900 text-white'
                : 'bg-white border border-surface-200 text-surface-500 hover:text-surface-900'
            }`}
          >
            최근 {w}일
          </button>
        ))}
        <span className="ml-auto text-xs text-surface-400 tabular-nums">
          합계 {totalVisits.toLocaleString()}회
        </span>
      </div>

      {/* 일별 방문 추이 */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-surface-200 rounded-2xl p-5"
      >
        <h3 className="text-sm font-bold text-surface-900 mb-4">일별 방문 추이</h3>
        {dailyLoading ? (
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

      {/* 인기 페이지 */}
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
          {pathsLoading ? (
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

      {/* 방문자 히스토리 */}
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
              onClick={() => setLoggedInOnly(true)}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-full transition-colors ${
                loggedInOnly
                  ? 'bg-surface-900 text-white'
                  : 'bg-surface-100 text-surface-500 hover:text-surface-900'
              }`}
            >
              로그인 유저만
            </button>
            <button
              onClick={() => setLoggedInOnly(false)}
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
          {historyLoading ? (
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
                  {formatTime(entry.visitedAt)}
                </span>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}

function formatTime(iso: string): string {
  try {
    const date = new Date(iso);
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return '방금';
    if (minutes < 60) return `${minutes}분 전`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}시간 전`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}일 전`;
    return date.toLocaleDateString('ko-KR');
  } catch {
    return iso;
  }
}
