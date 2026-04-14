import type { AdminNightCalendarEntry } from '@/entities/admin-night/model/types';
import {
  ADMIN_NIGHT_CALENDAR_DESCRIPTION,
  AdminNightSlot,
  describeParticipationMode,
} from '@/widgets/admin-night/lib/adminNight';

interface AdminNightCalendarProps {
  slots: AdminNightSlot[];
  entries?: AdminNightCalendarEntry[];
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

function schedulePanelTone(state: AdminNightSlot['state']) {
  if (state === 'tonight') return 'border-white/10 bg-white/10';
  if (state === 'weekend') return 'border-blue-200 bg-white/80';
  return 'border-surface-200 bg-surface-100';
}

function scheduleItemTone(state: AdminNightSlot['state']) {
  if (state === 'tonight') return 'border-white/10 bg-white/5';
  if (state === 'weekend') return 'border-blue-200 bg-blue-50/80';
  return 'border-surface-200 bg-white';
}

export function AdminNightCalendar({ slots, entries = [] }: AdminNightCalendarProps) {
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
          {ADMIN_NIGHT_CALENDAR_DESCRIPTION}
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {slots.map(slot => {
          const slotEntries = entries.filter(entry => entry.scheduledSlot?.slotKey === slot.slotKey);

          return (
            <article
              key={slot.slotKey}
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
                  {slot.badgeLabel}
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

              {slotEntries.length > 0 && (
                <div className={`mt-4 space-y-2 rounded-2xl border p-3 text-xs ${schedulePanelTone(slot.state)}`}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-bold leading-5">
                      Merge 된 신청 {slotEntries.length}건
                    </p>
                    <span className={`rounded-full px-2 py-1 text-[11px] font-bold ${badgeTone(slot.state)}`}>
                      Scheduled
                    </span>
                  </div>
                  <div className="space-y-2">
                    {slotEntries.slice(0, 2).map(entry => (
                      <div key={entry.id} className={`rounded-2xl border px-3 py-2 ${scheduleItemTone(slot.state)}`}>
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold leading-5">{entry.requesterLabel}</p>
                          <span className="rounded-full border border-surface-200/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] opacity-80">
                            {describeParticipationMode(entry.participationMode)}
                          </span>
                        </div>
                        <p className="mt-1 leading-5 opacity-80">{entry.taskTitle}</p>
                      </div>
                    ))}
                    {slotEntries.length > 2 && (
                      <p className="leading-5 opacity-75">
                        + {slotEntries.length - 2}건 더 일정에 올라와 있습니다.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
