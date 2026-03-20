import { motion } from 'framer-motion';
import type { ContributionDay } from '../lib/useGitHubContributions';

function getColor(level: number): string {
  if (level === 0) return '#e5e7eb';
  if (level === 1) return '#9ca3af';
  if (level === 2) return '#6b7280';
  if (level === 3) return '#374151';
  return '#111827';
}

function groupByWeek(days: ContributionDay[]): ContributionDay[][] {
  const weeks: ContributionDay[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  return weeks;
}

interface GitHubHeatmapProps {
  days: ContributionDay[];
}

export function GitHubHeatmap({ days }: GitHubHeatmapProps) {
  const allWeeks = groupByWeek(days);
  const recentWeeks = allWeeks.slice(-26);

  if (recentWeeks.length === 0) return null;

  return (
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

      <div className="overflow-x-auto">
        <div className="flex gap-[3px] min-w-max">
          {recentWeeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map(day => (
                <div
                  key={day.date}
                  className="w-3 h-3 rounded-sm cursor-default transition-transform hover:scale-125"
                  style={{ backgroundColor: getColor(day.level) }}
                  title={`${day.date}: ${day.count}개`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-1.5 mt-3 justify-end">
        <span className="text-[10px] text-surface-400">Less</span>
        {[0, 1, 2, 3, 4].map(v => (
          <div key={v} className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: getColor(v) }} />
        ))}
        <span className="text-[10px] text-surface-400">More</span>
      </div>
    </motion.div>
  );
}
