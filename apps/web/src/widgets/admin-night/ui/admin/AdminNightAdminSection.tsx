'use client';

import { useState } from 'react';
import {
  useAdminNightRequests,
  useApproveAdminNightRequest,
  useRejectAdminNightRequest,
  useRequestMoreAdminNightInfo,
} from '@/entities/admin-night/api/useAdminNight';
import type { AdminNightRequest } from '@/entities/admin-night/model/types';
import { buildUpcomingAdminNightSlots, describeParticipationMode } from '@/widgets/admin-night/lib/adminNight';

function RequestMeta({ request }: { request: AdminNightRequest }) {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-surface-400">Request PR</p>
        <h3 className="mt-2 text-xl font-black tracking-tight text-surface-900">
          {request.requesterName} · {request.taskTitle}
        </h3>
        <p className="mt-1 text-sm leading-6 text-surface-500">{request.requesterEmail}</p>
        <p className="mt-1 text-sm leading-6 text-surface-500">
          진행 방식: {describeParticipationMode(request.participationMode)}
        </p>
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

interface PendingActionsProps {
  request: AdminNightRequest;
  slotValue: string;
  reviewNote: string;
  onSlotChange: (requestId: string, slotKey: string) => void;
  onReviewNoteChange: (requestId: string, note: string) => void;
  onApprove: (request: AdminNightRequest) => void;
  onRequestMoreInfo: (request: AdminNightRequest) => void;
  onReject: (request: AdminNightRequest) => void;
  isPending: boolean;
}

function PendingActions({
  request,
  slotValue,
  reviewNote,
  onSlotChange,
  onReviewNoteChange,
  onApprove,
  onRequestMoreInfo,
  onReject,
  isPending,
}: PendingActionsProps) {
  const slotOptions = buildUpcomingAdminNightSlots(new Date(), 10);

  return (
    <div className="w-full max-w-sm space-y-3 rounded-[24px] border border-surface-200 bg-white p-4">
      <label className="block text-sm font-bold text-surface-900">merge 할 시간 선택</label>
      <select
        value={slotValue}
        onChange={event => onSlotChange(request.id, event.target.value)}
        className="w-full rounded-2xl border border-surface-200 bg-surface-50 px-4 py-3 text-sm text-surface-900 outline-none transition-colors focus:border-surface-900"
      >
        {slotOptions.map(slot => (
          <option key={slot.slotKey} value={slot.slotKey}>
            {slot.dateLabel} {slot.weekday} · {slot.timeLabel} · {slot.focus}
          </option>
        ))}
      </select>

      <div className="space-y-2">
        <label className="block text-sm font-bold text-surface-900">관리자 메모</label>
        <textarea
          data-cy={`admin-night-review-note-${request.id}`}
          value={reviewNote}
          onChange={event => onReviewNoteChange(request.id, event.target.value)}
          placeholder="실명 확인이 필요하거나, 함께 보고 싶은 배경이 더 필요하면 여기 적어 주세요."
          className="min-h-28 w-full rounded-2xl border border-surface-200 bg-surface-50 px-4 py-3 text-sm leading-7 text-surface-900 outline-none transition-colors placeholder:text-surface-300 focus:border-surface-900"
        />
      </div>

      <div className="grid gap-3">
        <button
          type="button"
          data-cy={`admin-night-approve-${request.id}`}
          onClick={() => onApprove(request)}
          disabled={isPending}
          className="inline-flex items-center justify-center rounded-2xl bg-surface-900 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-surface-800 disabled:bg-surface-300"
        >
          Merge 승인
        </button>
        <div className="grid gap-3 sm:grid-cols-2">
          <button
          type="button"
          data-cy={`admin-night-request-info-${request.id}`}
          onClick={() => onRequestMoreInfo(request)}
          disabled={isPending || !reviewNote.trim()}
          className="inline-flex items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900 transition-colors hover:bg-amber-100 disabled:text-amber-300"
        >
            추가 정보 요청
          </button>
          <button
            type="button"
            data-cy={`admin-night-reject-${request.id}`}
            onClick={() => onReject(request)}
            disabled={isPending}
            className="inline-flex items-center justify-center rounded-2xl border border-surface-200 bg-white px-4 py-3 text-sm font-bold text-surface-900 transition-colors hover:bg-surface-50 disabled:text-surface-300"
          >
            이번에는 보류
          </button>
        </div>
      </div>
    </div>
  );
}

export function AdminNightAdminSection() {
  const slotOptions = buildUpcomingAdminNightSlots(new Date(), 10);
  const { data: pendingRequests = [], isLoading } = useAdminNightRequests('PENDING');
  const { data: infoRequestedRequests = [] } = useAdminNightRequests('INFO_REQUESTED');
  const { data: approvedRequests = [] } = useAdminNightRequests('APPROVED');
  const approveMutation = useApproveAdminNightRequest();
  const requestInfoMutation = useRequestMoreAdminNightInfo();
  const rejectMutation = useRejectAdminNightRequest();
  const [slotByRequestId, setSlotByRequestId] = useState<Record<string, string>>({});
  const [reviewNoteByRequestId, setReviewNoteByRequestId] = useState<Record<string, string>>({});

  const isMutating = approveMutation.isPending || requestInfoMutation.isPending || rejectMutation.isPending;

  const resolveSlotKey = (request: AdminNightRequest) => slotByRequestId[request.id] ?? request.preferredSlot.slotKey;
  const resolveReviewNote = (request: AdminNightRequest) => reviewNoteByRequestId[request.id] ?? request.reviewNote ?? '';

  const handleApprove = (request: AdminNightRequest) => {
    const selectedSlot = slotOptions.find(slot => slot.slotKey === resolveSlotKey(request));
    if (!selectedSlot) {
      return;
    }

    approveMutation.mutate({
      requestId: request.id,
      scheduledSlot: {
        slotKey: selectedSlot.slotKey,
        date: selectedSlot.date,
        weekday: selectedSlot.weekday,
        timeLabel: selectedSlot.timeLabel,
        focus: selectedSlot.focus,
        badgeLabel: selectedSlot.badgeLabel,
      },
    });
  };

  const handleRequestMoreInfo = (request: AdminNightRequest) => {
    const reviewNote = resolveReviewNote(request).trim();
    if (!reviewNote) {
      return;
    }

    requestInfoMutation.mutate({
      requestId: request.id,
      reviewNote,
    });
  };

  const handleReject = (request: AdminNightRequest) => {
    rejectMutation.mutate({
      requestId: request.id,
      reviewNote: resolveReviewNote(request).trim(),
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-surface-400">Admin Night</p>
        <h1 className="text-3xl font-black tracking-tight text-surface-900">Admin Night 신청 관리</h1>
        <p className="max-w-3xl text-sm leading-7 text-surface-500 sm:text-[15px]">
          참가 신청 PR을 확인하고, 승인되면 같은 시간대의 실제 일정으로 merge 합니다. 실명이나 맥락이 더 필요한 경우에는
          메모와 함께 추가 정보를 요청하고, 신청자가 보완본을 다시 보내면 다시 review 합니다.
        </p>
      </div>

      <section className="rounded-[28px] border border-surface-200 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-surface-900">대기 중인 신청</h2>
            <p className="mt-1 text-sm leading-6 text-surface-500">
              시간과 의지를 리뷰하고, 승인되면 공개 보드에 바로 일정이 올라갑니다.
            </p>
          </div>
          <span className="rounded-full border border-surface-200 bg-surface-50 px-3 py-1 text-xs font-bold text-surface-600">
            {pendingRequests.length} pending
          </span>
        </div>

        {isLoading ? (
          <div className="mt-6 rounded-[24px] border border-surface-200 bg-surface-50 px-5 py-6 text-sm text-surface-500">
            Admin Night 신청을 불러오는 중입니다.
          </div>
        ) : pendingRequests.length === 0 ? (
          <div className="mt-6 rounded-[24px] border border-surface-200 bg-surface-50 px-5 py-6 text-sm leading-7 text-surface-500">
            지금은 대기 중인 신청 PR이 없습니다. 새로운 신청이 도착하면 여기서 바로 승인하거나 추가 정보를 요청할 수 있습니다.
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {pendingRequests.map(request => (
              <article key={request.id} className="rounded-[24px] border border-surface-200 bg-surface-50 p-5">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                  <RequestMeta request={request} />
                  <PendingActions
                    request={request}
                    slotValue={resolveSlotKey(request)}
                    reviewNote={resolveReviewNote(request)}
                    onSlotChange={(requestId, slotKey) =>
                      setSlotByRequestId(prev => ({
                        ...prev,
                        [requestId]: slotKey,
                      }))
                    }
                    onReviewNoteChange={(requestId, reviewNote) =>
                      setReviewNoteByRequestId(prev => ({
                        ...prev,
                        [requestId]: reviewNote,
                      }))
                    }
                    onApprove={handleApprove}
                    onRequestMoreInfo={handleRequestMoreInfo}
                    onReject={handleReject}
                    isPending={isMutating}
                  />
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-[28px] border border-surface-200 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-surface-900">보완 대기</h2>
            <p className="mt-1 text-sm leading-6 text-surface-500">
              추가 정보 요청을 보낸 신청입니다. 신청자가 보완본을 다시 보내면 자동으로 대기열로 돌아옵니다.
            </p>
          </div>
          <span className="rounded-full border border-surface-200 bg-surface-50 px-3 py-1 text-xs font-bold text-surface-600">
            {infoRequestedRequests.length} waiting
          </span>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {infoRequestedRequests.map(request => (
            <article key={request.id} className="rounded-[24px] border border-amber-200 bg-amber-50 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-amber-700">Info Requested</p>
              <h3 className="mt-2 text-lg font-black tracking-tight text-surface-900">
                {request.requesterName} · {request.taskTitle}
              </h3>
              <p className="mt-2 text-sm leading-6 text-surface-600">
                {describeParticipationMode(request.participationMode)} · {request.preferredSlot.date}{' '}
                {request.preferredSlot.weekday} · {request.preferredSlot.timeLabel}
              </p>
              {request.reviewNote && <p className="mt-3 text-sm leading-7 text-amber-900">{request.reviewNote}</p>}
            </article>
          ))}
          {infoRequestedRequests.length === 0 && (
            <div className="rounded-[24px] border border-surface-200 bg-surface-50 px-5 py-6 text-sm text-surface-500">
              추가 정보 응답을 기다리는 신청이 없습니다.
            </div>
          )}
        </div>
      </section>

      <section className="rounded-[28px] border border-surface-200 bg-white p-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-black tracking-tight text-surface-900">승인된 일정</h2>
          <p className="text-sm leading-6 text-surface-500">이미 merge 된 신청은 여기서 다시 확인할 수 있습니다.</p>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {approvedRequests.slice(0, 6).map(request => (
            <article key={request.id} className="rounded-[24px] border border-surface-200 bg-surface-50 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-surface-400">Merged</p>
              <h3 className="mt-2 text-lg font-black tracking-tight text-surface-900">
                {request.requesterName} · {request.taskTitle}
              </h3>
              <p className="mt-2 text-sm leading-6 text-surface-500">
                진행 방식: {describeParticipationMode(request.participationMode)}
              </p>
              {request.scheduledSlot && (
                <p className="mt-3 text-sm leading-6 text-surface-500">
                  {request.scheduledSlot.date} {request.scheduledSlot.weekday} · {request.scheduledSlot.timeLabel} ·{' '}
                  {request.scheduledSlot.focus}
                </p>
              )}
            </article>
          ))}
          {approvedRequests.length === 0 && (
            <div className="rounded-[24px] border border-surface-200 bg-surface-50 px-5 py-6 text-sm text-surface-500">
              아직 merge 된 일정이 없습니다.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
