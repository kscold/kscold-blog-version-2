'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useAdminNightCalendar, useMyAdminNightRequests } from '@/entities/admin-night';
import { useCreateAdminNightRequest, useResubmitAdminNightRequest } from '@/features/admin-night';
import type { AdminNightRequest } from '@/entities/admin-night';
import { useViewer } from '@/entities/user';
import {
  buildAdminNightSlots,
  buildUpcomingAdminNightSlots,
  findAdminNightSlot,
  getAdminNightDateKey,
  type AdminNightParticipationMode,
} from '@/widgets/admin-night/lib/adminNight';
import { buildAdminNightPreferredSlot, parseAdminNightTimeRange } from '@/widgets/admin-night/lib/adminNightTime';
import { useAdminNightDateKey } from './useAdminNightDateKey';

export function useAdminNightPage(initialDateKey: string) {
  const { isAuthenticated, user } = useViewer();
  const todayKey = useAdminNightDateKey(initialDateKey);
  const weekSlots = useMemo(() => buildAdminNightSlots(todayKey), [todayKey]);
  const upcomingSlots = useMemo(
    () => buildUpcomingAdminNightSlots(todayKey, 10),
    [todayKey]
  );
  const weekDates = useMemo(
    () => ({ from: weekSlots[0].date, to: weekSlots[weekSlots.length - 1].date }),
    [weekSlots]
  );
  const initialRange = useMemo(() => parseAdminNightTimeRange(upcomingSlots[0]?.timeLabel), [upcomingSlots]);
  const hasPrefilledRequesterName = useRef(false);
  const [requesterName, setRequesterName] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [message, setMessage] = useState('');
  const [participationMode, setParticipationMode] = useState<AdminNightParticipationMode>('FLEXIBLE');
  const [selectedDate, setSelectedDate] = useState(upcomingSlots[0]?.date ?? '');
  const [timeRange, setTimeRange] = useState(initialRange);
  const [editingRequestId, setEditingRequestId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const { data: calendarEntries = [] } = useAdminNightCalendar(weekDates.from, weekDates.to);
  const { data: myRequests = [] } = useMyAdminNightRequests(isAuthenticated);
  const createRequestMutation = useCreateAdminNightRequest();
  const resubmitRequestMutation = useResubmitAdminNightRequest();

  useEffect(() => {
    if (!hasPrefilledRequesterName.current && !requesterName.trim() && user?.displayName) {
      setRequesterName(user.displayName);
      hasPrefilledRequesterName.current = true;
    }
  }, [requesterName, user?.displayName]);

  useEffect(() => {
    if (upcomingSlots.some(slot => slot.date === selectedDate)) return;
    const nextSlot = upcomingSlots[0];
    setSelectedDate(nextSlot?.date ?? '');
    setTimeRange(parseAdminNightTimeRange(nextSlot?.timeLabel));
  }, [selectedDate, upcomingSlots]);

  const currentUpcomingSlots = () => {
    const currentDateKey = getAdminNightDateKey(new Date());
    return currentDateKey === todayKey
      ? upcomingSlots
      : buildUpcomingAdminNightSlots(currentDateKey, 10);
  };

  const resetForm = () => {
    const currentSlots = currentUpcomingSlots();
    setRequesterName(user?.displayName ?? '');
    setTaskTitle('');
    setMessage('');
    setParticipationMode('FLEXIBLE');
    setSelectedDate(currentSlots[0]?.date ?? '');
    setTimeRange(parseAdminNightTimeRange(currentSlots[0]?.timeLabel));
    setEditingRequestId(null);
  };

  const canSubmitRequest =
    requesterName.trim().length > 0 &&
    taskTitle.trim().length > 0 &&
    selectedDate.length > 0;

  const handleSubmit = async () => {
    const selectedSlot =
      currentUpcomingSlots().find(slot => slot.date === selectedDate) ?? null;
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

      resetForm();
      setStatusMessage(
        editingRequestId
          ? '보완한 신청을 다시 보냈습니다. 확인 뒤 일정이 캘린더에 merge 됩니다.'
          : '신청 PR을 보냈습니다. 승인되면 일정이 캘린더에 merge 됩니다.'
      );
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : '신청을 보내지 못했습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  const handleStartResubmit = (request: AdminNightRequest) => {
    const currentSlots = currentUpcomingSlots();
    setEditingRequestId(request.id);
    setRequesterName(request.requesterName);
    setTaskTitle(request.taskTitle);
    setMessage(request.message ?? '');
    setParticipationMode(request.participationMode ?? 'FLEXIBLE');
    const slot =
      currentSlots.find(item => item.date === request.preferredSlot.date) ??
      findAdminNightSlot(currentSlots, request.preferredSlot.slotKey) ??
      currentSlots[0] ??
      null;
    setSelectedDate(slot?.date ?? '');
    setTimeRange(parseAdminNightTimeRange(request.preferredSlot.timeLabel, parseAdminNightTimeRange(slot?.timeLabel)));
    setStatusMessage('관리자 메모를 반영해 내용을 보완한 뒤 다시 보내주세요.');
  };

  const handleCancelResubmit = () => {
    resetForm();
    setStatusMessage(null);
  };

  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
    const slot = upcomingSlots.find(item => item.date === date);
    if (slot) {
      setTimeRange(parseAdminNightTimeRange(slot.timeLabel));
    }
  };

  return {
    calendarEntries,
    canSubmitRequest,
    createRequestMutation,
    editingRequestId,
    handleCancelResubmit,
    handleSelectDate,
    handleStartResubmit,
    handleSubmit,
    isAuthenticated,
    isSubmitting: createRequestMutation.isPending || resubmitRequestMutation.isPending,
    message,
    myRequests,
    participationMode,
    requesterName,
    selectedDate,
    setMessage,
    setParticipationMode,
    setRequesterName,
    setTaskTitle,
    setTimeRange,
    statusMessage,
    taskTitle,
    timeRange,
    upcomingSlots,
    weekSlots,
  };
}
