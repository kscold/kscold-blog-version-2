'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useViewer } from '@/entities/user/model/useViewer';
import {
  useAdminNightCalendar,
  useCreateAdminNightRequest,
  useMyAdminNightRequests,
  useResubmitAdminNightRequest,
} from '@/entities/admin-night/api/useAdminNight';
import type { AdminNightRequest } from '@/entities/admin-night/model/types';
import {
  ADMIN_NIGHT_CALENDAR_DESCRIPTION,
  ADMIN_NIGHT_CULTURE_PARAGRAPHS,
  ADMIN_NIGHT_CULTURE_TITLE,
  ADMIN_NIGHT_HERO_PARAGRAPHS,
  ADMIN_NIGHT_HERO_TITLE,
  ADMIN_NIGHT_KEYWORDS,
  ADMIN_NIGHT_PARTICIPATION_OPTIONS,
  ADMIN_NIGHT_PROCESS_DESCRIPTION,
  ADMIN_NIGHT_STEPS,
  ADMIN_NIGHT_PROCESS_TITLE,
  buildAdminNightSlots,
  buildUpcomingAdminNightSlots,
  findAdminNightSlot,
} from '@/widgets/admin-night/lib/adminNight';
import {
  buildAdminNightPreferredSlot,
  parseAdminNightTimeRange,
} from '@/widgets/admin-night/lib/adminNightTime';
import { AdminNightCalendar } from './AdminNightCalendar';
import { AdminNightRequestPanel } from './AdminNightRequestPanel';

export function AdminNightPage() {
  const { isAuthenticated, user } = useViewer();
  const weekSlots = buildAdminNightSlots(new Date());
  const upcomingSlots = buildUpcomingAdminNightSlots(new Date(), 10);
  const defaultRange = parseAdminNightTimeRange(upcomingSlots[0]?.timeLabel);
  const [requesterName, setRequesterName] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [message, setMessage] = useState('');
  const [participationMode, setParticipationMode] = useState<(typeof ADMIN_NIGHT_PARTICIPATION_OPTIONS)[number]['value']>('FLEXIBLE');
  const [selectedDate, setSelectedDate] = useState(upcomingSlots[0]?.date ?? '');
  const [timeRange, setTimeRange] = useState(defaultRange);
  const [editingRequestId, setEditingRequestId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const hasPrefilledRequesterName = useRef(false);
  const { data: calendarEntries = [] } = useAdminNightCalendar(weekSlots[0].date, weekSlots[weekSlots.length - 1].date);
  const { data: myRequests = [] } = useMyAdminNightRequests(isAuthenticated);
  const createRequestMutation = useCreateAdminNightRequest();
  const resubmitRequestMutation = useResubmitAdminNightRequest();
  const canSubmitRequest = requesterName.trim().length > 0
    && taskTitle.trim().length > 0
    && selectedDate.length > 0;

  useEffect(() => {
    if (!hasPrefilledRequesterName.current && !requesterName.trim() && user?.displayName) {
      setRequesterName(user.displayName);
      hasPrefilledRequesterName.current = true;
    }
  }, [requesterName, user?.displayName]);

  const handleSubmit = async () => {
    const selectedSlot = upcomingSlots.find(slot => slot.date === selectedDate) ?? null;
    if (!requesterName.trim()) {
      setStatusMessage('실제 만남과 일정 안내에 사용할 실명을 먼저 적어주세요.');
      return;
    }
    if (!taskTitle.trim()) {
      setStatusMessage('오늘 끝내고 싶은 일을 한 줄로 적어주세요.');
      return;
    }
    if (!selectedSlot) {
      setStatusMessage('만날 시간을 먼저 골라주세요.');
      return;
    }

    try {
      const payload = {
        requesterName,
        taskTitle,
        message,
        participationMode,
        preferredSlot: buildAdminNightPreferredSlot(selectedSlot, timeRange),
      };

      if (editingRequestId) {
        await resubmitRequestMutation.mutateAsync({
          requestId: editingRequestId,
          ...payload,
        });
      } else {
        await createRequestMutation.mutateAsync(payload);
      }

      setRequesterName(user?.displayName ?? '');
      setTaskTitle('');
      setMessage('');
      setParticipationMode('FLEXIBLE');
      setSelectedDate(upcomingSlots[0]?.date ?? '');
      setTimeRange(parseAdminNightTimeRange(upcomingSlots[0]?.timeLabel));
      setEditingRequestId(null);
      setStatusMessage(
        editingRequestId
          ? '보완한 신청을 다시 보냈습니다. 확인 뒤 일정이 캘린더에 merge 됩니다.'
          : '신청 PR을 보냈습니다. 승인되면 일정이 캘린더에 merge 됩니다.'
      );
    } catch (error) {
      if (error instanceof Error) {
        setStatusMessage(error.message);
        return;
      }
      setStatusMessage('신청을 보내지 못했습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  const handleStartResubmit = (request: AdminNightRequest) => {
    setEditingRequestId(request.id);
    setRequesterName(request.requesterName);
    setTaskTitle(request.taskTitle);
    setMessage(request.message ?? '');
    setParticipationMode(request.participationMode ?? 'FLEXIBLE');
    const slot = upcomingSlots.find(item => item.date === request.preferredSlot.date)
      ?? findAdminNightSlot(upcomingSlots, request.preferredSlot.slotKey)
      ?? upcomingSlots[0]
      ?? null;
    setSelectedDate(slot?.date ?? '');
    setTimeRange(parseAdminNightTimeRange(request.preferredSlot.timeLabel, parseAdminNightTimeRange(slot?.timeLabel)));
    setStatusMessage('관리자 메모를 반영해 내용을 보완한 뒤 다시 보내주세요.');
  };

  const handleCancelResubmit = () => {
    setEditingRequestId(null);
    setRequesterName(user?.displayName ?? '');
    setTaskTitle('');
    setMessage('');
    setParticipationMode('FLEXIBLE');
    setSelectedDate(upcomingSlots[0]?.date ?? '');
    setTimeRange(parseAdminNightTimeRange(upcomingSlots[0]?.timeLabel));
    setStatusMessage(null);
  };

  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
    const slot = upcomingSlots.find(item => item.date === date);
    if (slot) {
      setTimeRange(parseAdminNightTimeRange(slot.timeLabel));
    }
  };

  return (
    <main className="min-h-screen px-4 pb-20 pt-28 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="rounded-[32px] border border-surface-200 bg-white px-6 py-8 shadow-sm sm:px-8 sm:py-10">
          <div className="max-w-4xl space-y-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-surface-400">
              Admin Night
            </p>
            <h1 className="text-4xl font-black tracking-tight text-surface-900 sm:text-5xl">
              {ADMIN_NIGHT_HERO_TITLE}
            </h1>
            <div className="space-y-3 text-base leading-8 text-surface-500 sm:text-lg">
              {ADMIN_NIGHT_HERO_PARAGRAPHS.map(paragraph => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {ADMIN_NIGHT_KEYWORDS.map(keyword => (
                <span
                  key={keyword}
                  className="rounded-full border border-surface-200 bg-surface-50 px-3 py-1.5 text-xs font-bold text-surface-600"
                >
                  {keyword}
                </span>
              ))}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="#admin-night-request"
                data-cy="admin-night-hero-primary"
                className="inline-flex items-center justify-center rounded-2xl bg-surface-900 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-surface-800"
              >
                Admin Night 신청 보내기
              </Link>
              <Link
                href="/guestbook"
                data-cy="admin-night-hero-secondary"
                className="inline-flex items-center justify-center rounded-2xl border border-surface-200 bg-white px-6 py-3 text-sm font-bold text-surface-900 transition-colors hover:bg-surface-50"
              >
                방명록에 한 줄 남기기
              </Link>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
          <section className="rounded-[28px] border border-surface-200 bg-white p-6 sm:p-7">
            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-surface-400">
                Core Concept
              </p>
              <h2 className="text-2xl font-black tracking-tight text-surface-900">
                {ADMIN_NIGHT_PROCESS_TITLE}
              </h2>
              <p className="max-w-2xl break-keep text-sm leading-8 text-surface-500 sm:text-[15px]">
                {ADMIN_NIGHT_PROCESS_DESCRIPTION}
              </p>
            </div>

            <div className="mt-6 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
              {ADMIN_NIGHT_STEPS.map((step, index) => (
                <article key={step.id} className="rounded-[24px] border border-surface-200 bg-surface-50 p-5 sm:p-6">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 min-w-8 items-center justify-center rounded-full bg-surface-900 px-2 text-xs font-black text-white">
                      {index + 1}
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-surface-400">
                      Step {index + 1}
                    </span>
                  </div>
                  <div className="mt-4 space-y-2">
                    <h3 className="break-keep text-lg font-black leading-7 tracking-tight text-surface-900">
                      {step.title}
                    </h3>
                    <p className="break-keep text-sm leading-7 text-surface-500">{step.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <div className="xl:pt-2">
            <AdminNightRequestPanel
              isAuthenticated={isAuthenticated}
              activeEditingRequestId={editingRequestId}
              requesterName={requesterName}
              taskTitle={taskTitle}
              message={message}
              participationMode={participationMode}
              selectedDate={selectedDate}
              startMinutes={timeRange.startMinutes}
              endMinutes={timeRange.endMinutes}
              dateOptions={upcomingSlots}
              isSubmitting={createRequestMutation.isPending || resubmitRequestMutation.isPending}
              canSubmit={canSubmitRequest}
              statusMessage={statusMessage}
              requests={myRequests}
              onRequesterNameChange={setRequesterName}
              onTaskTitleChange={setTaskTitle}
              onMessageChange={setMessage}
              onParticipationModeChange={setParticipationMode}
              onStartResubmit={handleStartResubmit}
              onCancelResubmit={handleCancelResubmit}
              onSelectDate={handleSelectDate}
              onTimeRangeChange={setTimeRange}
              onSubmit={handleSubmit}
            />
          </div>
        </div>

        <AdminNightCalendar slots={weekSlots} entries={calendarEntries} />

        <section className="rounded-[28px] border border-surface-200 bg-white p-6 sm:p-8">
          <div className="max-w-4xl space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-surface-400">
              Culture Note
            </p>
            <h2 className="text-3xl font-black tracking-tight text-surface-900">
              {ADMIN_NIGHT_CULTURE_TITLE}
            </h2>
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
