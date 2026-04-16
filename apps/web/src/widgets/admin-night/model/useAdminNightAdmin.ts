'use client';

import { useMemo, useState } from 'react';
import {
  useAdminNightRequests,
  useApproveAdminNightRequest,
  useRejectAdminNightRequest,
  useRequestMoreAdminNightInfo,
} from '@/entities/admin-night/api/useAdminNight';
import type { AdminNightRequest } from '@/entities/admin-night/model/types';
import { buildUpcomingAdminNightSlots } from '@/widgets/admin-night/lib/adminNight';

export function useAdminNightAdmin() {
  const slotOptions = useMemo(() => buildUpcomingAdminNightSlots(new Date(), 10), []);
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

  return {
    approvedRequests,
    handleApprove,
    handleReject,
    handleRequestMoreInfo,
    infoRequestedRequests,
    isLoading,
    isMutating,
    pendingRequests,
    resolveReviewNote,
    resolveSlotKey,
    slotOptions,
    updateReviewNote: (requestId: string, reviewNote: string) =>
      setReviewNoteByRequestId(prev => ({ ...prev, [requestId]: reviewNote })),
    updateSlot: (requestId: string, slotKey: string) =>
      setSlotByRequestId(prev => ({ ...prev, [requestId]: slotKey })),
  };
}
