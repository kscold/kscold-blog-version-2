'use client';

import Link from 'next/link';
import { AdminNightRequest } from '@/entities/admin-night/model/types';
import {
  ADMIN_NIGHT_PARTICIPATION_OPTIONS,
  AdminNightParticipationMode,
  AdminNightSlot,
} from '@/widgets/admin-night/lib/adminNight';
import { AdminNightMyRequests } from './AdminNightMyRequests';
import { AdminNightTimeRangePicker } from './AdminNightTimeRangePicker';

interface AdminNightRequestPanelProps {
  isAuthenticated: boolean;
  activeEditingRequestId?: string | null;
  requesterName: string;
  taskTitle: string;
  message: string;
  participationMode: AdminNightParticipationMode;
  selectedDate: string;
  startMinutes: number;
  endMinutes: number;
  dateOptions: AdminNightSlot[];
  isSubmitting: boolean;
  canSubmit: boolean;
  statusMessage: string | null;
  requests: AdminNightRequest[];
  onRequesterNameChange: (value: string) => void;
  onTaskTitleChange: (value: string) => void;
  onMessageChange: (value: string) => void;
  onParticipationModeChange: (value: AdminNightParticipationMode) => void;
  onStartResubmit: (request: AdminNightRequest) => void;
  onCancelResubmit: () => void;
  onSelectDate: (date: string) => void;
  onTimeRangeChange: (range: { startMinutes: number; endMinutes: number }) => void;
  onSubmit: () => void;
}

export function AdminNightRequestPanel({
  isAuthenticated,
  activeEditingRequestId,
  requesterName,
  taskTitle,
  message,
  participationMode,
  selectedDate,
  startMinutes,
  endMinutes,
  dateOptions,
  isSubmitting,
  canSubmit,
  statusMessage,
  requests,
  onRequesterNameChange,
  onTaskTitleChange,
  onMessageChange,
  onParticipationModeChange,
  onStartResubmit,
  onCancelResubmit,
  onSelectDate,
  onTimeRangeChange,
  onSubmit,
}: AdminNightRequestPanelProps) {
  return (
    <div className="space-y-4">
      <section id="admin-night-request" className="rounded-[28px] border border-surface-200 bg-white p-6">
        <div className="space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-surface-400">
            {activeEditingRequestId ? 'Resubmit PR' : 'Participation PR'}
          </p>
          <h2 className="text-2xl font-black tracking-tight text-surface-900">
            {activeEditingRequestId ? '추가 정보를 반영해 다시 보내 주세요' : '만나고 싶은 일과 시간을 남겨 주세요'}
          </h2>
          <p className="text-sm leading-7 text-surface-500 sm:text-[15px]">
            {activeEditingRequestId
              ? '관리자 메모를 반영해 내용을 보완하면 같은 신청이 다시 대기열로 올라갑니다. 확인이 끝나면 승인과 함께 실제 만남 일정으로 이어집니다.'
              : '오늘 끝낼 일과 가능한 시간대를 남겨 주세요. 김승찬이 확인하고 승인하면 일정이 캘린더에 merge 되고, 실제 온·오프라인의 만남 흐름으로 이어집니다.'}
          </p>
        </div>

        <div className="mt-6 space-y-4">
          {isAuthenticated ? (
            <>
              <div className="space-y-2">
                <label htmlFor="admin-night-requester-name" className="text-sm font-bold text-surface-900">
                  실명
                </label>
                <input
                  id="admin-night-requester-name"
                  data-cy="admin-night-request-name"
                  value={requesterName}
                  onChange={event => onRequesterNameChange(event.target.value)}
                  required
                  placeholder="실제 만남과 일정 안내에 사용할 이름을 적어 주세요."
                  className="w-full rounded-2xl border border-surface-200 bg-surface-50 px-4 py-3 text-sm text-surface-900 outline-none transition-colors placeholder:text-surface-300 focus:border-surface-900"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="admin-night-task-title" className="text-sm font-bold text-surface-900">
                  오늘 끝내고 싶은 일
                </label>
                <input
                  id="admin-night-task-title"
                  data-cy="admin-night-request-title"
                  value={taskTitle}
                  onChange={event => onTaskTitleChange(event.target.value)}
                  required
                  placeholder="메일 답장, 블로그 초안, 작은 버그 수정처럼 오늘 끝낼 일을 한 줄로 적어 주세요."
                  className="w-full rounded-2xl border border-surface-200 bg-surface-50 px-4 py-3 text-sm text-surface-900 outline-none transition-colors placeholder:text-surface-300 focus:border-surface-900"
                />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-bold text-surface-900">진행 방식</p>
                <div className="grid gap-2 sm:grid-cols-3">
                  {ADMIN_NIGHT_PARTICIPATION_OPTIONS.map(option => (
                    <button
                      key={option.value}
                      type="button"
                      data-cy={`admin-night-mode-${option.value.toLowerCase()}`}
                      onClick={() => onParticipationModeChange(option.value)}
                      className={`rounded-2xl border px-4 py-3 text-left transition-colors ${
                        participationMode === option.value
                          ? 'border-surface-900 bg-surface-900 text-white'
                          : 'border-surface-200 bg-surface-50 text-surface-900 hover:border-surface-300'
                      }`}
                    >
                      <p className="text-sm font-black">{option.label}</p>
                      <p className="mt-1 text-xs leading-5 opacity-80">{option.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-bold text-surface-900">만날 날짜</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {dateOptions.map(slot => (
                    <button
                      key={slot.date}
                      type="button"
                      data-cy={`admin-night-date-option-${slot.date}`}
                      onClick={() => onSelectDate(slot.date)}
                      className={`rounded-2xl border px-4 py-3 text-left transition-colors ${
                        selectedDate === slot.date
                          ? 'border-surface-900 bg-surface-900 text-white'
                          : 'border-surface-200 bg-surface-50 text-surface-900 hover:border-surface-300'
                      }`}
                    >
                      <p className="text-xs font-bold uppercase tracking-[0.22em] opacity-70">{slot.weekday}</p>
                      <p className="mt-1 text-sm font-black">{slot.dateLabel}</p>
                      <p className="mt-2 text-sm font-semibold">{slot.focus}</p>
                      <p className="mt-1 text-xs leading-5 opacity-80">{slot.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              <AdminNightTimeRangePicker
                startMinutes={startMinutes}
                endMinutes={endMinutes}
                onChange={onTimeRangeChange}
              />

              <div className="space-y-2">
                <label htmlFor="admin-night-message" className="text-sm font-bold text-surface-900">
                  같이 보고 싶은 맥락
                </label>
                <textarea
                  id="admin-night-message"
                  data-cy="admin-night-request-message"
                  value={message}
                  onChange={event => onMessageChange(event.target.value)}
                  placeholder="왜 이걸 지금 끝내고 싶은지, 어디까지 마무리하고 싶은지 짧게 남겨 주세요."
                  className="min-h-32 w-full rounded-2xl border border-surface-200 bg-surface-50 px-4 py-3 text-sm leading-7 text-surface-900 outline-none transition-colors placeholder:text-surface-300 focus:border-surface-900"
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  data-cy="admin-night-request-submit"
                  onClick={onSubmit}
                  disabled={isSubmitting || !canSubmit}
                  className="inline-flex items-center justify-center rounded-2xl bg-surface-900 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-surface-800 disabled:cursor-not-allowed disabled:bg-surface-300"
                >
                  {isSubmitting
                    ? activeEditingRequestId
                      ? '보완본 다시 보내는 중…'
                      : '신청 PR 보내는 중…'
                    : activeEditingRequestId
                      ? '보완해서 다시 보내기'
                      : 'Admin Night 신청 보내기'}
                </button>
                {activeEditingRequestId && (
                  <button
                    type="button"
                    onClick={onCancelResubmit}
                    className="inline-flex items-center justify-center rounded-2xl border border-surface-200 bg-white px-5 py-3 text-sm font-bold text-surface-900 transition-colors hover:bg-surface-50"
                  >
                    새 신청으로 돌아가기
                  </button>
                )}
                <Link
                  href="/guestbook"
                  className="inline-flex items-center justify-center rounded-2xl border border-surface-200 bg-white px-5 py-3 text-sm font-bold text-surface-900 transition-colors hover:bg-surface-50"
                >
                  방명록에 한 줄 남기기
                </Link>
              </div>
              {!canSubmit && (
                <p className="text-xs leading-6 text-surface-400">
                  실명과 오늘 끝낼 일을 적어야 신청을 보낼 수 있습니다.
                </p>
              )}
            </>
          ) : (
            <div className="rounded-[24px] border border-surface-200 bg-surface-50 p-5">
              <p className="text-sm leading-7 text-surface-500">
                Admin Night 신청은 로그인한 상태에서 보낼 수 있습니다. 로그인 후 오늘 끝낼 일과 원하는 시간대를
                남기면, 확인 뒤 일정이 캘린더에 merge 됩니다.
              </p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/login?redirect=%2Fadmin-night"
                  data-cy="admin-night-request-login"
                  className="inline-flex items-center justify-center rounded-2xl bg-surface-900 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-surface-800"
                >
                  로그인하고 신청하기
                </Link>
                <Link
                  href="/guestbook"
                  className="inline-flex items-center justify-center rounded-2xl border border-surface-200 bg-white px-5 py-3 text-sm font-bold text-surface-900 transition-colors hover:bg-surface-50"
                >
                  방명록에 한 줄 남기기
                </Link>
              </div>
            </div>
          )}

          {statusMessage && (
            <p className="rounded-2xl border border-surface-200 bg-surface-50 px-4 py-3 text-sm leading-6 text-surface-600">
              {statusMessage}
            </p>
          )}
        </div>
      </section>

      {isAuthenticated && (
        <AdminNightMyRequests
          requests={requests}
          activeEditingRequestId={activeEditingRequestId}
          onStartResubmit={onStartResubmit}
          onCancelResubmit={onCancelResubmit}
        />
      )}
    </div>
  );
}
