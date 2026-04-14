import { AdminNightSlot } from '@/widgets/admin/lib/adminNight';

interface AdminNightCalendarProps {
  slots: AdminNightSlot[];
}

function toneClasses(state: AdminNightSlot['state']) {
  if (state === 'today') {
    return 'border-surface-900 bg-surface-900 text-white shadow-lg shadow-surface-900/10';
  }

  if (state === 'closed') {
    return 'border-surface-200 bg-surface-50 text-surface-500';
  }

  return 'border-surface-200 bg-white text-surface-900';
}

function badgeClasses(state: AdminNightSlot['state']) {
  if (state === 'today') {
    return 'bg-white/15 text-white';
  }

  if (state === 'closed') {
    return 'bg-surface-200 text-surface-500';
  }

  return 'bg-blue-50 text-blue-700';
}

function badgeLabel(state: AdminNightSlot['state']) {
  if (state === 'today') return 'Tonight';
  if (state === 'closed') return '완료';
  return '신청 열림';
}

export function AdminNightCalendar({ slots }: AdminNightCalendarProps) {
  return (
    <div className="rounded-[28px] border border-surface-200 bg-surface-50/80 p-4 sm:p-5">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-surface-400">
            Night Calendar
          </p>
          <h3 className="text-lg font-black tracking-tight text-surface-900">
            이번 주 야간 신청 보드
          </h3>
        </div>
        <p className="max-w-xl text-sm leading-6 text-surface-500">
          퇴근 후 같이 붙어 초안, 링크, QA, 답장 흐름을 정리하는 주간 보드입니다.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-7">
        {slots.map((slot) => (
          <div
            key={slot.id}
            data-cy={slot.state === 'today' ? 'admin-night-slot-today' : undefined}
            className={`rounded-3xl border p-4 transition-colors ${toneClasses(slot.state)}`}
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] opacity-70">
                  {slot.weekday}
                </p>
                <p className="mt-1 text-sm font-semibold">{slot.dateLabel}</p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${badgeClasses(slot.state)}`}>
                {badgeLabel(slot.state)}
              </span>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-black leading-5 tracking-tight">
                {slot.focus}
              </p>
              <p className="text-xs font-medium leading-5 opacity-70">
                {slot.timeLabel}
              </p>
              <p className="text-xs leading-5 opacity-80 [overflow-wrap:anywhere]">
                {slot.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
