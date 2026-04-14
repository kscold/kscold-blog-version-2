import { AdminNightSlot } from '@/widgets/admin-night/lib/adminNight';

interface AdminNightCalendarProps {
  slots: AdminNightSlot[];
}

function cardTone(state: AdminNightSlot['state']) {
  if (state === 'tonight') {
    return 'border-surface-900 bg-surface-900 text-white shadow-lg shadow-surface-900/10';
  }

  if (state === 'weekend') {
    return 'border-blue-100 bg-blue-50/80 text-surface-900';
  }

  return 'border-surface-200 bg-white text-surface-900';
}

function badgeTone(state: AdminNightSlot['state']) {
  if (state === 'tonight') return 'bg-white/15 text-white';
  if (state === 'weekend') return 'bg-blue-100 text-blue-700';
  return 'bg-surface-100 text-surface-500';
}

function badgeLabel(state: AdminNightSlot['state']) {
  if (state === 'tonight') return 'Tonight';
  if (state === 'weekend') return 'Weekend';
  return 'Open';
}

export function AdminNightCalendar({ slots }: AdminNightCalendarProps) {
  return (
    <section className="rounded-[28px] border border-surface-200 bg-surface-50/80 p-4 sm:p-5">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-surface-400">
            Night Calendar
          </p>
          <h2 className="text-xl font-black tracking-tight text-surface-900">
            이번 주 Admin Night 보드
          </h2>
        </div>
        <p className="max-w-2xl text-sm leading-6 text-surface-500">
          정해진 강의나 스터디보다, 같은 시간대에 각자 할 일을 끝내는 조용한 작업 문화에 가깝습니다.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
        {slots.map((slot) => (
          <article
            key={slot.id}
            data-cy={slot.state === 'tonight' ? 'admin-night-slot-tonight' : undefined}
            className={`rounded-3xl border p-4 transition-colors ${cardTone(slot.state)}`}
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] opacity-70">
                  {slot.weekday}
                </p>
                <p className="mt-1 text-sm font-semibold">{slot.dateLabel}</p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${badgeTone(slot.state)}`}>
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
          </article>
        ))}
      </div>
    </section>
  );
}
