'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/shared/api/api-client';
import type {
  AdminNightParticipationMode,
  AdminNightProgramExperienceLevel,
  AdminNightProgramFoodPreference,
  AdminNightProgramInterestLevel,
  AdminNightProgramPreferredDay,
  AdminNightProgramPreferredFormat,
  AdminNightProgramSessionLength,
  AdminNightProgramSessionStyle,
  AdminNightProgramVote,
  AdminNightRequest,
  AdminNightSlotPayload,
} from '@/entities/admin-night/model/types';

interface CreateAdminNightRequestPayload {
  requesterName: string;
  taskTitle: string;
  message?: string;
  participationMode: AdminNightParticipationMode;
  preferredSlot: AdminNightSlotPayload;
}

interface AdminNightReviewPayload {
  requestId: string;
  reviewNote: string;
}

export interface UpsertAdminNightProgramVotePayload {
  requesterName: string;
  contactEmail: string;
  contact: string;
  interestLevel: AdminNightProgramInterestLevel;
  preferredFormat: AdminNightProgramPreferredFormat;
  experienceLevel: AdminNightProgramExperienceLevel;
  sessionStyle: AdminNightProgramSessionStyle;
  sessionLength: AdminNightProgramSessionLength;
  foodPreference: AdminNightProgramFoodPreference;
  preferredDays: AdminNightProgramPreferredDay[];
  preferredTimes: string[];
  interestedTopics: string[];
  desiredTakeaways: string;
  message?: string;
}

export function useCreateAdminNightRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateAdminNightRequestPayload) =>
      apiClient.post<AdminNightRequest>('/admin-night/requests', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-night'] });
    },
  });
}

export function useResubmitAdminNightRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requestId, ...payload }: CreateAdminNightRequestPayload & { requestId: string }) =>
      apiClient.put<AdminNightRequest>(`/admin-night/requests/${requestId}/resubmit`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-night'] });
    },
  });
}

export function useApproveAdminNightRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      requestId,
      scheduledSlot,
    }: {
      requestId: string;
      scheduledSlot: AdminNightSlotPayload;
    }) =>
      apiClient.put<AdminNightRequest>(`/admin/admin-night/requests/${requestId}/approve`, {
        scheduledSlot,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-night'] });
    },
  });
}

export function useRejectAdminNightRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requestId, reviewNote }: AdminNightReviewPayload) =>
      apiClient.put<AdminNightRequest>(`/admin/admin-night/requests/${requestId}/reject`, {
        reviewNote,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-night'] });
    },
  });
}

export function useRequestMoreAdminNightInfo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requestId, reviewNote }: AdminNightReviewPayload) =>
      apiClient.put<AdminNightRequest>(`/admin/admin-night/requests/${requestId}/request-info`, {
        reviewNote,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-night'] });
    },
  });
}

export function useUpsertAdminNightProgramVote(programKey: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpsertAdminNightProgramVotePayload) =>
      apiClient.post<AdminNightProgramVote>(`/admin-night/programs/${programKey}/votes`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-night', 'programs', programKey] });
    },
  });
}
