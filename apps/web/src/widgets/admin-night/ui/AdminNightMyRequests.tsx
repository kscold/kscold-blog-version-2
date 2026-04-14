'use client';

import { AdminNightRequest } from '@/entities/admin-night/model/types';
import { describeParticipationMode } from '@/widgets/admin-night/lib/adminNight';

interface AdminNightMyRequestsProps {
  requests: AdminNightRequest[];
  activeEditingRequestId?: string | null;
  onStartResubmit: (request: AdminNightRequest) => void;
  onCancelResubmit: () => void;
}

function statusTone(status: AdminNightRequest['status']) {
  if (status === 'APPROVED') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (status === 'INFO_REQUESTED') return 'bg-amber-50 text-amber-700 border-amber-200';
  if (status === 'REJECTED') return 'bg-rose-50 text-rose-700 border-rose-200';
  return 'bg-surface-100 text-surface-600 border-surface-200';
}

function statusLabel(status: AdminNightRequest['status']) {
  if (status === 'APPROVED') return 'Merge 완료';
  if (status === 'INFO_REQUESTED') return '추가 정보 요청됨';
  if (status === 'REJECTED') return '보류';
  return '대기 중';
}

export function AdminNightMyRequests({
  requests,
  activeEditingRequestId,
  onStartResubmit,
  onCancelResubmit,
}: AdminNightMyRequestsProps) {
  if (requests.length === 0) {
    return null;
  }

  return (
    <section className="rounded-[28px] border border-surface-200 bg-white p-6">
      <div className="space-y-1">
        <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-surface-400">
          My Requests
        </p>
        <h2 className="text-2xl font-black tracking-tight text-surface-900">
          내 신청 흐름
        </h2>
      </div>

      <div className="mt-4 space-y-3">
        {requests.slice(0, 3).map(request => (
          <article key={request.id} className="rounded-[24px] border border-surface-200 bg-surface-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-black tracking-tight text-surface-900">{request.taskTitle}</h3>
                <p className="mt-1 text-sm leading-6 text-surface-500">
                  실명: {request.requesterName} · {describeParticipationMode(request.participationMode)}
                </p>
                <p className="mt-1 text-sm leading-6 text-surface-500">
                  희망 시간: {request.preferredSlot.date} {request.preferredSlot.weekday} ·{' '}
                  {request.preferredSlot.timeLabel} · {request.preferredSlot.focus}
                </p>
              </div>
              <span className={`rounded-full border px-3 py-1 text-xs font-bold ${statusTone(request.status)}`}>
                {statusLabel(request.status)}
              </span>
            </div>

            {request.status === 'INFO_REQUESTED' && request.reviewNote && (
              <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-700">
                  관리자 메모
                </p>
                <p className="mt-2 text-sm leading-7 text-amber-900">{request.reviewNote}</p>
              </div>
            )}

            {request.status === 'APPROVED' && request.scheduledSlot && (
              <p className="mt-3 text-sm leading-6 text-surface-600">
                merge 된 일정: {request.scheduledSlot.date} {request.scheduledSlot.weekday} ·{' '}
                {request.scheduledSlot.timeLabel} · {request.scheduledSlot.focus}
              </p>
            )}

            {request.message && <p className="mt-3 text-sm leading-7 text-surface-500">{request.message}</p>}

            {request.status === 'INFO_REQUESTED' && (
              <div className="mt-4 flex flex-wrap gap-3">
                {activeEditingRequestId === request.id ? (
                  <button
                    type="button"
                    onClick={onCancelResubmit}
                    className="inline-flex items-center justify-center rounded-2xl border border-surface-200 bg-white px-4 py-2.5 text-sm font-bold text-surface-900 transition-colors hover:bg-surface-100"
                  >
                    보완 작성 닫기
                  </button>
                ) : (
                  <button
                    type="button"
                    data-cy={`admin-night-resubmit-start-${request.id}`}
                    onClick={() => onStartResubmit(request)}
                    className="inline-flex items-center justify-center rounded-2xl bg-surface-900 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-surface-800"
                  >
                    보완해서 다시 보내기
                  </button>
                )}
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
