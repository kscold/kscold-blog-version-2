'use client';

import { AdminNightRequest } from '@/entities/admin-night/model/types';
import {
  AdminNightParticipationMode,
  AdminNightSlot,
} from '@/widgets/admin-night/lib/adminNight';
import { AdminNightMyRequests } from './AdminNightMyRequests';
import { AdminNightRequestForm } from './request/AdminNightRequestForm';
import { AdminNightRequestGuestPrompt } from './request/AdminNightRequestGuestPrompt';

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
  const panelTitle = activeEditingRequestId ? '추가 정보를 반영해 다시 보내 주세요' : '만나고 싶은 일과 시간을 남겨 주세요';
  const panelDescription = activeEditingRequestId
    ? '관리자 메모를 반영해 내용을 보완하면 같은 신청이 다시 대기열로 올라갑니다. 확인이 끝나면 승인과 함께 실제 만남 일정으로 이어집니다.'
    : '오늘 끝낼 일과 가능한 시간대를 남겨 주세요. 김승찬이 확인하고 승인하면 일정이 캘린더에 merge 되고, 실제 온·오프라인의 만남 흐름으로 이어집니다.';

  return (
    <div className="space-y-4">
      <section id="admin-night-request" className="rounded-[28px] border border-surface-200 bg-white p-6">
        <div className="space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-surface-400">
            {activeEditingRequestId ? 'Resubmit PR' : 'Participation PR'}
          </p>
          <h2 className="text-2xl font-black tracking-tight text-surface-900">{panelTitle}</h2>
          <p className="text-sm leading-7 text-surface-500 sm:text-[15px]">{panelDescription}</p>
        </div>

        <div className="mt-6 space-y-4">
          {isAuthenticated ? (
            <AdminNightRequestForm
              activeEditingRequestId={activeEditingRequestId}
              requesterName={requesterName}
              taskTitle={taskTitle}
              message={message}
              participationMode={participationMode}
              selectedDate={selectedDate}
              startMinutes={startMinutes}
              endMinutes={endMinutes}
              dateOptions={dateOptions}
              isSubmitting={isSubmitting}
              canSubmit={canSubmit}
              onRequesterNameChange={onRequesterNameChange}
              onTaskTitleChange={onTaskTitleChange}
              onMessageChange={onMessageChange}
              onParticipationModeChange={onParticipationModeChange}
              onCancelResubmit={onCancelResubmit}
              onSelectDate={onSelectDate}
              onTimeRangeChange={onTimeRangeChange}
              onSubmit={onSubmit}
            />
          ) : (
            <AdminNightRequestGuestPrompt />
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
