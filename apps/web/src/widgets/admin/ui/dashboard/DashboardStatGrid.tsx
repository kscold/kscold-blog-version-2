import Link from 'next/link';

export interface DashboardStat {
  name: string;
  value: number;
  link: string;
}

export function DashboardStatGrid({ stats }: { stats: DashboardStat[] }) {
  return (
    <section
      aria-label="콘텐츠 현황"
      className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-7"
    >
      {stats.map(stat => (
        <Link
          key={stat.name}
          href={stat.link}
          className="rounded-2xl border border-surface-200 bg-white p-4 transition-colors hover:border-surface-400"
        >
          <span className="block text-2xl font-black tabular-nums text-surface-900 sm:text-3xl">
            {stat.value.toLocaleString('ko-KR')}
          </span>
          <span className="mt-1 block text-xs font-medium text-surface-500">{stat.name}</span>
        </Link>
      ))}
    </section>
  );
}
