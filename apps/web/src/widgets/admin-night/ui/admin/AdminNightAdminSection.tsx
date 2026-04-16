'use client';

import { describeParticipationMode } from '@/widgets/admin-night/lib/adminNight';
import { useAdminNightAdmin } from '@/widgets/admin-night/model/useAdminNightAdmin';
import { AdminNightPendingActions } from './AdminNightPendingActions';
import { AdminNightRequestMeta } from './AdminNightRequestMeta';
import { AdminNightStatusSection } from './AdminNightStatusSection';

export function AdminNightAdminSection() {
  const state = useAdminNightAdmin();

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

      <AdminNightStatusSection
        title="대기 중인 신청"
        description="시간과 의지를 리뷰하고, 승인되면 공개 보드에 바로 일정이 올라갑니다."
        countLabel={`${state.pendingRequests.length} pending`}
      >
        {state.isLoading ? (
          <div className="rounded-[24px] border border-surface-200 bg-surface-50 px-5 py-6 text-sm text-surface-500">
            Admin Night 신청을 불러오는 중입니다.
          </div>
        ) : state.pendingRequests.length === 0 ? (
          <div className="rounded-[24px] border border-surface-200 bg-surface-50 px-5 py-6 text-sm leading-7 text-surface-500">
            지금은 대기 중인 신청 PR이 없습니다. 새로운 신청이 도착하면 여기서 바로 승인하거나 추가 정보를 요청할 수 있습니다.
          </div>
        ) : (
          <div className="space-y-4">
            {state.pendingRequests.map(request => (
              <article key={request.id} className="rounded-[24px] border border-surface-200 bg-surface-50 p-5">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                  <AdminNightRequestMeta request={request} />
                  <AdminNightPendingActions
                    request={request}
                    slotOptions={state.slotOptions}
                    slotValue={state.resolveSlotKey(request)}
                    reviewNote={state.resolveReviewNote(request)}
                    onSlotChange={state.updateSlot}
                    onReviewNoteChange={state.updateReviewNote}
                    onApprove={state.handleApprove}
                    onRequestMoreInfo={state.handleRequestMoreInfo}
                    onReject={state.handleReject}
                    isPending={state.isMutating}
                  />
                </div>
              </article>
            ))}
          </div>
        )}
      </AdminNightStatusSection>

      <AdminNightStatusSection
        title="보완 대기"
        description="추가 정보 요청을 보낸 신청입니다. 신청자가 보완본을 다시 보내면 자동으로 대기열로 돌아옵니다."
        countLabel={`${state.infoRequestedRequests.length} waiting`}
      >
        <div className="grid gap-3 md:grid-cols-2">
          {state.infoRequestedRequests.map(request => (
            <article key={request.id} className="rounded-[24px] border border-amber-200 bg-amber-50 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-amber-700">추가 정보 요청됨</p>
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
          {state.infoRequestedRequests.length === 0 && (
            <div className="rounded-[24px] border border-surface-200 bg-surface-50 px-5 py-6 text-sm text-surface-500">
              추가 정보 응답을 기다리는 신청이 없습니다.
            </div>
          )}
        </div>
      </AdminNightStatusSection>

      <AdminNightStatusSection
        title="승인된 일정"
        description="이미 merge 된 신청은 여기서 다시 확인할 수 있습니다."
      >
        <div className="grid gap-3 md:grid-cols-2">
          {state.approvedRequests.slice(0, 6).map(request => (
            <article key={request.id} className="rounded-[24px] border border-surface-200 bg-surface-50 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-surface-400">Merged</p>
              <h3 className="mt-2 text-lg font-black tracking-tight text-surface-900">
                {request.requesterName} · {request.taskTitle}
              </h3>
              <p className="mt-2 text-sm leading-6 text-surface-500">진행 방식: {describeParticipationMode(request.participationMode)}</p>
              {request.scheduledSlot && (
                <p className="mt-3 text-sm leading-6 text-surface-500">
                  {request.scheduledSlot.date} {request.scheduledSlot.weekday} · {request.scheduledSlot.timeLabel} ·{' '}
                  {request.scheduledSlot.focus}
                </p>
              )}
            </article>
          ))}
          {state.approvedRequests.length === 0 && (
            <div className="rounded-[24px] border border-surface-200 bg-surface-50 px-5 py-6 text-sm text-surface-500">
              아직 merge 된 일정이 없습니다.
            </div>
          )}
        </div>
      </AdminNightStatusSection>
    </div>
  );
}
