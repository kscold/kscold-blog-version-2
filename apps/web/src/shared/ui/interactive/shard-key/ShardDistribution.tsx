import type { ShardName } from './shardKeyModel';

interface ShardShare {
  shard: ShardName;
  docs: number;
  percent: number;
}

interface ShardDistributionProps {
  shares: ShardShare[];
  targetShards: ShardName[];
}

// 한 샤드가 이 비율을 넘으면 몰림으로 보고 경고 색을 쓴다.
const HOT_SHARD_PERCENT = 70;

export function ShardDistribution({ shares, targetShards }: ShardDistributionProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {shares.map(share => {
        const isHot = share.percent >= HOT_SHARD_PERCENT;
        const isTarget = targetShards.includes(share.shard);
        return (
          <div
            key={share.shard}
            data-shard={share.shard}
            data-targeted={isTarget}
            className={`rounded-xl border p-4 transition-colors ${
              isTarget
                ? 'border-primary-400 bg-primary-50/60 dark:border-primary-400/60 dark:bg-primary-500/10'
                : 'border-surface-200 bg-surface-50 dark:border-surface-700 dark:bg-surface-800/60'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-sm font-semibold text-surface-900 dark:text-white">{share.shard}</span>
              {isTarget && (
                <span className="rounded-full bg-primary-600 px-2 py-0.5 text-[11px] font-bold text-white">조회 대상</span>
              )}
            </div>
            <p className="mt-2 text-2xl font-bold text-surface-900 dark:text-white">{share.percent}%</p>
            <p className="text-xs text-surface-500 dark:text-surface-400">메시지 {share.docs.toLocaleString('ko-KR')}개</p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-200 dark:bg-surface-700">
              <div
                className={`h-full rounded-full ${isHot ? 'bg-red-500' : 'bg-emerald-500'}`}
                style={{ width: `${share.percent}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
