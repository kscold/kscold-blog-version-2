'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useVaultGraph } from '@/entities/vault/api/useVault';
import { usePosts } from '@/entities/post/api/usePosts';

interface ContributionDay {
  date: string;
  contributionCount: number;
}

interface GitHubStats {
  total: number;
  // 날짜별 배열 (jogruber API: contributions[])
  days: ContributionDay[];
}

// 기여 수 → 모노톤 그레이 강도
function getColor(count: number): string {
  if (count === 0) return '#e5e7eb';
  if (count <= 3) return '#9ca3af';
  if (count <= 6) return '#6b7280';
  if (count <= 9) return '#374151';
  return '#111827';
}

// 일(day) 배열을 7행 × N열 주(week) 2D 배열로 변환
function groupByWeek(days: ContributionDay[]): ContributionDay[][] {
  const weeks: ContributionDay[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  return weeks;
}

export function StatsSection() {
  const [github, setGithub] = useState<GitHubStats | null>(null);
  const { data: graphData } = useVaultGraph();
  const { data: postsData } = usePosts({ page: 0, size: 1 });

  useEffect(() => {
    const year = new Date().getFullYear();
    fetch(`https://github-contributions-api.jogruber.de/v4/kscold?y=${year}`)
      .then(r => r.json())
      .then(d => setGithub({
        total: d.total?.[year] ?? 0,
        days: d.contributions ?? [],
      }))
      .catch(() => {});
  }, []);

  const noteCount = graphData?.nodes?.length ?? null;
  const postCount = postsData?.totalElements ?? null;
  const commitCount = github?.total ?? null;

  // 최근 26주만 표시
  const allWeeks = groupByWeek(github?.days ?? []);
  const recentWeeks = allWeeks.slice(-26);

  const stats = [
    { label: 'Vault Notes',   value: noteCount,   suffix: '개', description: '지식 노드' },
    { label: 'Blog Posts',    value: postCount,    suffix: '편', description: '발행된 글' },
    { label: 'Contributions', value: commitCount,  suffix: '',   description: `${new Date().getFullYear()}년 기여` },
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white border-t border-surface-200">
      <div className="max-w-5xl mx-auto space-y-12">

        {/* 헤더 */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-xs font-bold tracking-[0.25em] text-surface-400 uppercase mb-3">
            By the Numbers
          </p>
          <p className="text-surface-500 text-base leading-relaxed">
            지식을 기록하고, 기록을 연결하고, 연결을 공유합니다.
          </p>
        </motion.div>

        {/* 스탯 카드 3개 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="rounded-2xl border border-surface-200 bg-surface-50 p-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <p className="text-xs font-bold text-surface-400 uppercase tracking-widest mb-1">
                {stat.label}
              </p>
              <div className="flex items-end gap-1 my-2">
                {stat.value !== null && stat.value > 0 ? (
                  <>
                    <span className="text-4xl font-black tabular-nums text-surface-900">
                      {stat.value.toLocaleString()}
                    </span>
                    {stat.suffix && (
                      <span className="text-lg font-bold text-surface-400 mb-1">{stat.suffix}</span>
                    )}
                  </>
                ) : (
                  <span className="text-4xl font-black tabular-nums text-surface-300">—</span>
                )}
              </div>
              <p className="text-xs text-surface-400">{stat.description}</p>
            </motion.div>
          ))}
        </div>

        {/* GitHub 컨트리뷰션 히트맵 */}
        {recentWeeks.length > 0 && (
          <motion.div
            className="rounded-2xl border border-surface-200 bg-surface-50 p-6"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold text-surface-400 uppercase tracking-widest">
                GitHub Activity · {new Date().getFullYear()}
              </p>
              <a
                href="https://github.com/kscold"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-surface-400 hover:text-surface-700 transition-colors font-medium"
              >
                @kscold →
              </a>
            </div>

            {/* 히트맵 */}
            <div className="overflow-x-auto">
              <div className="flex gap-[3px] min-w-max">
                {recentWeeks.map((week, wi) => (
                  <div key={wi} className="flex flex-col gap-[3px]">
                    {week.map(day => (
                      <div
                        key={day.date}
                        className="w-3 h-3 rounded-sm cursor-default transition-transform hover:scale-125"
                        style={{ backgroundColor: getColor(day.contributionCount) }}
                        title={`${day.date}: ${day.contributionCount}개`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* 범례 */}
            <div className="flex items-center gap-1.5 mt-3 justify-end">
              <span className="text-[10px] text-surface-400">Less</span>
              {[0, 3, 6, 9, 12].map(v => (
                <div key={v} className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: getColor(v) }} />
              ))}
              <span className="text-[10px] text-surface-400">More</span>
            </div>
          </motion.div>
        )}

        {/* CTA */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Link
            href="/vault"
            className="inline-flex items-center gap-2 px-8 py-3 bg-surface-900 hover:bg-surface-800 text-white rounded-xl transition-colors font-bold shadow-lg text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Knowledge Graph 보기
          </Link>
        </motion.div>

      </div>
    </section>
  );
}
