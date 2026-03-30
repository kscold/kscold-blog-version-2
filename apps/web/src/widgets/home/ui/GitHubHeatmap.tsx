'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/shared/api/api-client';
import type { GitHubContributionDay } from '@/entities/github';

const COLORS = ['#ebedf0', '#bfc8d4', '#78849a', '#3d4a5e', '#1a1a2e'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface ContributionResponse {
  total: number;
  days: GitHubContributionDay[];
}

function useContributions(username: string, year: number) {
  return useQuery({
    queryKey: ['github-contributions', username, year],
    queryFn: () => apiClient.get<ContributionResponse>(`/github/${username}/contributions?year=${year}`),
    staleTime: 1000 * 60 * 30,
  });
}

type Cell = GitHubContributionDay | null;

function buildGrid(days: GitHubContributionDay[]) {
  if (days.length === 0) return { weeks: [] as Cell[][], monthLabels: [] as { label: string; col: number }[] };

  const firstDay = new Date(days[0].date + 'T00:00:00');
  const startDow = firstDay.getDay();
  const cells: Cell[] = [...Array(startDow).fill(null), ...days];
  const weeks: Cell[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, Math.min(i + 7, cells.length)));

  const monthLabels: { label: string; col: number }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, wi) => {
    const day = week.find(d => d !== null);
    if (!day) return;
    const m = new Date(day.date + 'T00:00:00').getMonth();
    if (m !== lastMonth) {
      monthLabels.push({ label: MONTHS[m], col: wi });
      lastMonth = m;
    }
  });
  return { weeks, monthLabels };
}

interface Props { username: string }

export function GitHubHeatmap({ username }: Props) {
  const currentYear = new Date().getFullYear();
  const availableYears = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const [year, setYear] = useState(currentYear);
  const { data } = useContributions(username, year);

  const days = data?.days ?? [];
  const total = data?.total ?? 0;
  const { weeks, monthLabels } = buildGrid(days);

  const CELL = 10;
  const GAP = 3;
  const STEP = CELL + GAP;
  const LEFT = 32;
  const TOP = 18;
  const svgW = LEFT + weeks.length * STEP - GAP;
  const svgH = TOP + 7 * STEP;

  if (weeks.length === 0) return null;

  return (
    <motion.div
      className="rounded-2xl border border-surface-200 bg-surface-50 p-4 sm:p-6"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold text-surface-500">
          {total.toLocaleString()} contributions in {year}
        </p>
        <a
          href={`https://github.com/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-surface-400 hover:text-surface-700 transition-colors font-medium"
        >
          @{username}
        </a>
      </div>

      <div className="flex gap-3">
        <div className="flex-1 overflow-x-auto pb-1">
          <svg viewBox={`0 0 ${svgW} ${svgH}`} className="block w-full h-auto">
            {monthLabels.map(({ label, col }, i) => {
              const next = monthLabels[i + 1]?.col ?? weeks.length;
              if (next - col < 3) return null;
              return (
                <text key={`${label}-${col}`} x={LEFT + col * STEP} y={12}
                  fill="#9ca3af" fontSize={10} fontFamily="system-ui, sans-serif">{label}</text>
              );
            })}
            {['Mon', 'Wed', 'Fri'].map((label, i) => (
              <text key={label} x={0} y={TOP + (1 + i * 2) * STEP + CELL - 2}
                fill="#9ca3af" fontSize={9} fontFamily="system-ui, sans-serif">{label}</text>
            ))}
            {weeks.map((week, wi) =>
              week.map((day, di) => {
                if (!day) return null;
                return (
                  <rect key={day.date}
                    x={LEFT + wi * STEP} y={TOP + di * STEP}
                    width={CELL} height={CELL} rx={2}
                    fill={COLORS[day.level] || COLORS[0]}>
                    <title>{`${day.date}: ${day.count}건`}</title>
                  </rect>
                );
              })
            )}
          </svg>
        </div>

        <div className="hidden sm:flex flex-col gap-1 shrink-0 pt-3">
          {availableYears.map(y => (
            <button key={y} onClick={() => setYear(y)}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                y === year ? 'bg-surface-900 text-white' : 'text-surface-400 hover:text-surface-600 hover:bg-surface-100'
              }`}>{y}</button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mt-2">
        <div className="flex sm:hidden gap-1">
          {availableYears.map(y => (
            <button key={y} onClick={() => setYear(y)}
              className={`px-2 py-1 text-[10px] font-bold rounded-md transition-colors ${
                y === year ? 'bg-surface-900 text-white' : 'text-surface-400 hover:bg-surface-100'
              }`}>{y}</button>
          ))}
        </div>
        <div className="flex items-center gap-1.5 ml-auto">
          <span className="text-[10px] text-surface-400">Less</span>
          {COLORS.map((c, i) => (
            <div key={i} className="w-[10px] h-[10px] rounded-sm" style={{ backgroundColor: c }} />
          ))}
          <span className="text-[10px] text-surface-400">More</span>
        </div>
      </div>
    </motion.div>
  );
}
