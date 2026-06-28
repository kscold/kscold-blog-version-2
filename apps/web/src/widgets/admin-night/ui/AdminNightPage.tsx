'use client';

import Link from 'next/link';
import {
  ADMIN_NIGHT_CALENDAR_DESCRIPTION,
  ADMIN_NIGHT_CULTURE_PARAGRAPHS,
  ADMIN_NIGHT_CULTURE_TITLE,
  AI_AGENT_BLOOM_DETAIL_PATH,
  buildAdminNightSlots,
} from '@/widgets/admin-night/lib/adminNight';
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

        <UpcomingOfflineSessionCard />

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

function UpcomingOfflineSessionCard() {
  return (
    <section className="overflow-hidden rounded-[28px] border border-surface-200 bg-surface-950 text-white shadow-soft">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-4 p-6 sm:p-8">
          <p className="text-[11px] font-black uppercase tracking-[0.28em] text-cyan-200">
            Upcoming Offline Session
          </p>
          <div className="max-w-3xl space-y-3">
            <h2 className="text-2xl font-black tracking-tight sm:text-4xl">
              진행 예정인 오프라인 세션을 준비 중입니다.
            </h2>
            <p className="text-sm leading-8 text-white/65">
              AI Agent Bloom은 LangGraph 기반 Agent 흐름을 함께 따라가 보는 오프라인 공유 세션입니다.
              바이브코딩을 적극 활용하며, 장소 대관·음식/음료·강의 준비를 포함한 예상 참가비는 2만~3만 원 사이입니다.
            </p>
          </div>
        </div>
        <div className="flex flex-col justify-center gap-3 border-t border-white/10 bg-white/[0.04] p-6 sm:p-8 lg:border-l lg:border-t-0">
          <div className="flex flex-wrap gap-2">
            {['오프라인 고정', '바이브코딩 활용', '예상 2만~3만 원'].map(label => (
              <span key={label} className="rounded-full border border-white/10 bg-white/10 px-3 py-2 text-xs font-black text-white/75">
                {label}
              </span>
            ))}
          </div>
          <Link
            href={AI_AGENT_BLOOM_DETAIL_PATH}
            className="inline-flex justify-center rounded-2xl bg-white px-5 py-3 text-sm font-black text-surface-950 transition-colors hover:bg-cyan-50"
          >
            오프라인 세션 보러가기
          </Link>
        </div>
      </div>
    </section>
  );
}
