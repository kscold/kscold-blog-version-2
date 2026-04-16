import type { AdminNightRequest } from '@/entities/admin-night/model/types';
import { describeParticipationMode } from '@/widgets/admin-night/lib/adminNight';

export function AdminNightRequestMeta({ request }: { request: AdminNightRequest }) {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-surface-400">Request PR</p>
        <h3 className="mt-2 text-xl font-black tracking-tight text-surface-900">
          {request.requesterName} · {request.taskTitle}
        </h3>
        <p className="mt-1 text-sm leading-6 text-surface-500">{request.requesterEmail}</p>
        <p className="mt-1 text-sm leading-6 text-surface-500">진행 방식: {describeParticipationMode(request.participationMode)}</p>
      </div>
      <div className="rounded-2xl border border-surface-200 bg-white px-4 py-3 text-sm leading-7 text-surface-500">
        희망 시간: {request.preferredSlot.date} {request.preferredSlot.weekday} · {request.preferredSlot.timeLabel} ·{' '}
        {request.preferredSlot.focus}
      </div>
      {request.message && <p className="text-sm leading-7 text-surface-600">{request.message}</p>}
      {request.reviewNote && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-700">관리자 메모</p>
          <p className="mt-2 text-sm leading-7 text-amber-900">{request.reviewNote}</p>
        </div>
      )}
    </div>
  );
}
