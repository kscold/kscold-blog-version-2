'use client';

import { ADMIN_NIGHT_CALENDAR_DESCRIPTION, ADMIN_NIGHT_CULTURE_PARAGRAPHS, ADMIN_NIGHT_CULTURE_TITLE, buildAdminNightSlots } from '@/widgets/admin-night/lib/adminNight';
import { useAdminNightPage } from '@/widgets/admin-night/model/useAdminNightPage';
import { AdminNightCalendar } from './AdminNightCalendar';
import { AdminNightHeroSection } from './AdminNightHeroSection';
import { AdminNightProcessSection } from './AdminNightProcessSection';
import { AdminNightRequestPanel } from './AdminNightRequestPanel';

export function AdminNightPage() {
  const weekSlots = buildAdminNightSlots(new Date());
  const state = useAdminNightPage({
    from: weekSlots[0].date,
    to: weekSlots[weekSlots.length - 1].date,
  });

  return (
    <main className="min-h-screen px-4 pb-20 pt-28 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <AdminNightHeroSection />

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
          <AdminNightProcessSection />

          <div className="xl:pt-2">
            <AdminNightRequestPanel
              isAuthenticated={state.isAuthenticated}
              activeEditingRequestId={state.editingRequestId}
              requesterName={state.requesterName}
              taskTitle={state.taskTitle}
              message={state.message}
              participationMode={state.participationMode}
              selectedDate={state.selectedDate}
              startMinutes={state.timeRange.startMinutes}
              endMinutes={state.timeRange.endMinutes}
              dateOptions={state.upcomingSlots}
              isSubmitting={state.isSubmitting}
              canSubmit={state.canSubmitRequest}
              statusMessage={state.statusMessage}
              requests={state.myRequests}
              onRequesterNameChange={state.setRequesterName}
              onTaskTitleChange={state.setTaskTitle}
              onMessageChange={state.setMessage}
              onParticipationModeChange={state.setParticipationMode}
              onStartResubmit={state.handleStartResubmit}
              onCancelResubmit={state.handleCancelResubmit}
              onSelectDate={state.handleSelectDate}
              onTimeRangeChange={state.setTimeRange}
              onSubmit={state.handleSubmit}
            />
          </div>
        </div>

        <AdminNightCalendar slots={weekSlots} entries={state.calendarEntries} />

        <section className="rounded-[28px] border border-surface-200 bg-white p-6 sm:p-8">
          <div className="max-w-4xl space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-surface-400">Culture Note</p>
            <h2 className="text-3xl font-black tracking-tight text-surface-900">{ADMIN_NIGHT_CULTURE_TITLE}</h2>
            <p className="text-sm leading-8 text-surface-500 sm:text-[15px]">{ADMIN_NIGHT_CALENDAR_DESCRIPTION}</p>
            {ADMIN_NIGHT_CULTURE_PARAGRAPHS.map(paragraph => (
              <p key={paragraph} className="text-sm leading-8 text-surface-500 sm:text-[15px]">
                {paragraph}
              </p>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
