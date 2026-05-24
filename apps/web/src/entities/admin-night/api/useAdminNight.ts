'use client';

import { useQuery } from '@tanstack/react-query';
import apiClient from '@/shared/api/api-client';
import type {
  AdminNightCalendarEntry,
  AdminNightRequest,
  AdminNightStatus,
} from '@/entities/admin-night/model/types';

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

export function useAdminNightRequests(status?: AdminNightStatus) {
  const query = status ? `?status=${status}` : '';

  return useQuery({
    queryKey: ['admin-night', 'admin-requests', status ?? 'ALL'],
    queryFn: () => apiClient.get<AdminNightRequest[]>(`/admin/admin-night/requests${query}`),
  });
}
