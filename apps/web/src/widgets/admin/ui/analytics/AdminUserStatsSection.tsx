'use client';

import { motion } from 'framer-motion';
import { useUserStats } from '@/entities/user';
import { RecentUsersList } from './RecentUsersList';

export function AdminUserStatsSection() {
  const { data: stats, isLoading } = useUserStats();

  if (isLoading || !stats) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-32 bg-surface-100 rounded-2xl" />
        <div className="h-48 bg-surface-100 rounded-2xl" />
      </div>
    );
  }

  const maxDaily = Math.max(...stats.dailySignups.map(d => d.count), 1);

  const summaryCards = [
    { label: '전체 가입자', value: stats.totalUsers, accent: 'text-surface-900' },
    { label: '오늘 신규', value: stats.newUsersToday, accent: 'text-emerald-600' },
    { label: '이번 주', value: stats.newUsersThisWeek, accent: 'text-blue-600' },
    { label: '이번 달', value: stats.newUsersThisMonth, accent: 'text-violet-600' },
  ];

  return (
    <div className="space-y-4">
      {/* 요약 카드 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {summaryCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white border border-surface-200 rounded-2xl p-4"
          >
            <div className={`text-2xl sm:text-3xl font-black tabular-nums ${card.accent}`}>
              {card.value.toLocaleString()}
            </div>
            <div className="text-xs font-medium text-surface-500 mt-1">{card.label}</div>
          </motion.div>
        ))}
      </div>

      {/* 신규 가입 트렌드 (7일) */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white border border-surface-200 rounded-2xl p-5"
      >
        <h3 className="text-sm font-bold text-surface-900 mb-4">신규 가입 추이 (최근 7일)</h3>
        <div className="flex items-end gap-1.5" style={{ height: 72 }}>
          {stats.dailySignups.map(day => (
            <div key={day.date} className="flex flex-col items-center gap-1 flex-1">
              <span className="text-[10px] font-bold text-surface-700 tabular-nums leading-none">
                {day.count > 0 ? day.count : ''}
              </span>
              <div className="w-full bg-surface-100 rounded-sm overflow-hidden flex-1">
                <div
                  className="w-full bg-surface-800 rounded-sm transition-all duration-700"
                  style={{
                    height: `${Math.round((day.count / maxDaily) * 100)}%`,
                    minHeight: day.count > 0 ? 4 : 0,
                  }}
                />
              </div>
              <span className="text-[9px] text-surface-400 leading-none">{day.date}</span>
            </div>
          ))}
        </div>
      </motion.div>

      <RecentUsersList users={stats.recentUsers} />
    </div>
  );
}
