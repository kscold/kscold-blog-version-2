import type { AdminNightRequest } from '@/entities/admin-night/model/types';
import type { AdminNightSlot } from '@/widgets/admin-night/lib/adminNight';

interface AdminNightPendingActionsProps {
  request: AdminNightRequest;
  slotOptions: AdminNightSlot[];
  slotValue: string;
  reviewNote: string;
  isPending: boolean;
  onSlotChange: (requestId: string, slotKey: string) => void;
  onReviewNoteChange: (requestId: string, note: string) => void;
  onApprove: (request: AdminNightRequest) => void;
  onRequestMoreInfo: (request: AdminNightRequest) => void;
  onReject: (request: AdminNightRequest) => void;
}

export function AdminNightPendingActions({
  request,
  slotOptions,
  slotValue,
  reviewNote,
  isPending,
  onSlotChange,
  onReviewNoteChange,
  onApprove,
  onRequestMoreInfo,
  onReject,
}: AdminNightPendingActionsProps) {
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
