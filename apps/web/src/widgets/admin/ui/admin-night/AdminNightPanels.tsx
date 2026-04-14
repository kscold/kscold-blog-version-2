import Link from 'next/link';
import { AdminNightActionItem, AdminNightQueueItem } from '@/widgets/admin/lib/adminNight';

interface AdminNightPanelsProps {
  queue: AdminNightQueueItem[];
  actions: AdminNightActionItem[];
}

function queueToneClasses(tone: AdminNightQueueItem['tone']) {
  if (tone === 'draft') return 'bg-amber-50 text-amber-700';
  if (tone === 'archived') return 'bg-surface-100 text-surface-500';
  if (tone === 'focus') return 'bg-blue-50 text-blue-700';
  return 'bg-emerald-50 text-emerald-700';
}

export function AdminNightPanels({ queue, actions }: AdminNightPanelsProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-[28px] border border-surface-200 bg-white p-5">
        <div className="space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-surface-400">
            Tonight Runbook
          </p>
          <h3 className="text-lg font-black tracking-tight text-surface-900">
            오늘 밤 같이 붙을 흐름
          </h3>
        </div>

        <div className="mt-4 space-y-3">
          {actions.map((action) => (
            <Link
              key={action.id}
              href={action.link}
              data-cy={`admin-night-action-${action.id}`}
              className="flex items-start justify-between gap-3 rounded-2xl border border-surface-200 bg-surface-50 px-4 py-3 transition-colors hover:border-surface-300 hover:bg-white"
            >
              <div className="min-w-0 space-y-1">
                <p className="text-sm font-bold leading-5 text-surface-900">{action.label}</p>
                <p className="text-xs leading-5 text-surface-500 [overflow-wrap:anywhere]">{action.detail}</p>
              </div>
              <span className="mt-1 text-sm text-surface-400">↗</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="rounded-[28px] border border-surface-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-surface-400">
              PR Queue
            </p>
            <h3 className="text-lg font-black tracking-tight text-surface-900">
              오늘 밤 바로 손댈 카드
            </h3>
          </div>
          <Link href="/admin/posts" className="text-sm font-medium text-surface-500 hover:text-surface-900">
            전체 보기
          </Link>
        </div>

        <div className="space-y-3">
          {queue.map((item) => (
            <Link
              key={item.id}
              href={item.link}
              className="block rounded-2xl border border-surface-200 p-4 transition-colors hover:border-surface-300 hover:bg-surface-50"
            >
              <div className="mb-2 flex items-center justify-between gap-3">
                <h4 className="text-sm font-bold leading-5 text-surface-900 [overflow-wrap:anywhere]">
                  {item.title}
                </h4>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${queueToneClasses(item.tone)}`}>
                  {item.tone === 'draft' ? '초안' : item.tone === 'archived' ? '보관' : item.tone === 'focus' ? '시작' : '검수'}
                </span>
              </div>
              <p className="text-xs leading-5 text-surface-500 [overflow-wrap:anywhere]">
                {item.detail}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
