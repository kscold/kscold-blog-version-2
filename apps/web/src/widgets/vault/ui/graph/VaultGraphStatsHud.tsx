'use client';

interface VaultGraphStatsHudProps {
  nodeCount: number;
  linkCount: number;
  zoomPct: number;
}

// 그래프 통계 HUD
export function VaultGraphStatsHud({ nodeCount, linkCount, zoomPct }: VaultGraphStatsHudProps) {
  return (
    <div
      aria-hidden="true"
      className="hidden lg:block absolute bottom-3 left-3 z-10 pointer-events-none select-none rounded-full border border-surface-200/60 dark:border-surface-700/60 bg-white/70 dark:bg-surface-900/70 px-3 py-1.5 font-mono text-[10px] tracking-wider text-surface-400 backdrop-blur-sm"
    >
      {nodeCount} notes · {linkCount} links · {zoomPct}%
    </div>
  );
}
