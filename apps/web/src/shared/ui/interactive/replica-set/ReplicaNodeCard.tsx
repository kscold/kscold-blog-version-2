import type { NodeRole, ReplicaNode } from './replicaSetModel';

const ROLE_STYLES: Record<NodeRole, { label: string; caption: string; card: string; badge: string }> = {
  primary: {
    label: 'PRIMARY',
    caption: '쓰기를 받아요',
    card: 'border-emerald-300 bg-emerald-50/70 dark:border-emerald-500/40 dark:bg-emerald-500/10',
    badge: 'bg-emerald-600 text-white',
  },
  secondary: {
    label: 'SECONDARY',
    caption: 'Primary를 따라 복제해요',
    card: 'border-surface-200 bg-surface-50 dark:border-surface-700 dark:bg-surface-800/60',
    badge: 'bg-surface-200 text-surface-700 dark:bg-surface-700 dark:text-surface-100',
  },
  electing: {
    label: '선거 중',
    caption: '새 Primary를 뽑는 중이에요',
    card: 'border-amber-300 bg-amber-50/70 dark:border-amber-500/40 dark:bg-amber-500/10',
    badge: 'bg-amber-500 text-white',
  },
  offline: {
    label: '꺼짐',
    caption: '응답이 없어요',
    card: 'border-dashed border-surface-300 bg-white opacity-75 dark:border-surface-700 dark:bg-surface-900',
    badge: 'bg-surface-100 text-surface-500 dark:bg-surface-800 dark:text-surface-400',
  },
};

interface ReplicaNodeCardProps {
  node: ReplicaNode;
  role: NodeRole;
  onToggle: (nodeId: string) => void;
}

export function ReplicaNodeCard({ node, role, onToggle }: ReplicaNodeCardProps) {
  const style = ROLE_STYLES[role];
  const actionLabel = node.isOnline ? '끄기' : '다시 켜기';

  return (
    <div data-node-role={role} className={`flex flex-col gap-2 rounded-xl border p-4 transition-colors ${style.card}`}>
      <span className="text-sm font-semibold text-surface-900 dark:text-white">노드 {node.id}</span>
      <span className={`w-fit rounded-full px-2 py-0.5 text-[11px] font-bold tracking-wide ${style.badge}`}>
        {style.label}
      </span>
      <p className="text-xs text-surface-500 dark:text-surface-400">{style.caption}</p>
      <button
        type="button"
        aria-label={`노드 ${node.id} ${actionLabel}`}
        onClick={() => onToggle(node.id)}
        className="mt-1 rounded-lg border border-surface-200 bg-white px-3 py-1.5 text-sm font-medium text-surface-700 transition-colors hover:border-surface-300 hover:text-surface-900 dark:border-surface-700 dark:bg-surface-900 dark:text-surface-200 dark:hover:border-surface-600 dark:hover:text-white"
      >
        {actionLabel}
      </button>
    </div>
  );
}
