'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/shared/api/api-client';
import type {
  AdminNightCalendarEntry,
  AdminNightParticipationMode,
  AdminNightRequest,
  AdminNightSlotPayload,
  AdminNightStatus,
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

export function useAdminNightCalendar(from: string, to: string) {
  return useQuery({
    queryKey: ['admin-night', 'calendar', from, to],
    queryFn: () =>
      apiClient.get<AdminNightCalendarEntry[]>(`/admin-night/calendar?from=${from}&to=${to}`),
  });
}

export function useMyAdminNightRequests(enabled: boolean) {
  return useQuery({
    queryKey: ['admin-night', 'my-requests'],
    queryFn: () => apiClient.get<AdminNightRequest[]>('/admin-night/requests/me'),
    enabled,
  });
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

export function useAdminNightRequests(status?: AdminNightStatus) {
  const query = status ? `?status=${status}` : '';

  return useQuery({
    queryKey: ['admin-night', 'admin-requests', status ?? 'ALL'],
    queryFn: () => apiClient.get<AdminNightRequest[]>(`/admin/admin-night/requests${query}`),
  });
}

export function useApproveAdminNightRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requestId, scheduledSlot }: { requestId: string; scheduledSlot: AdminNightSlotPayload }) =>
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
      apiClient.put<AdminNightRequest>(`/admin/admin-night/requests/${requestId}/reject`, { reviewNote }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-night'] });
    },
  });
}

export function useRequestMoreAdminNightInfo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requestId, reviewNote }: AdminNightReviewPayload) =>
      apiClient.put<AdminNightRequest>(`/admin/admin-night/requests/${requestId}/request-info`, { reviewNote }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-night'] });
    },
  });
}
