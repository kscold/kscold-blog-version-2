import { useQuery } from '@tanstack/react-query';
import apiClient from '@/shared/api/api-client';

export interface PathStat {
  path: string;
  visits: number;
  uniqueVisitors: number;
}

export interface DailyStat {
  date: string;
  visits: number;
}

export function useTopPaths(days = 7, limit = 20) {
  return useQuery<PathStat[]>({
    queryKey: ['admin', 'analytics', 'top-paths', days, limit],
    queryFn: () => apiClient.get<PathStat[]>(`/admin/analytics/top-paths?days=${days}&limit=${limit}`),
    refetchInterval: 60000,
  });
}

export function useDailyVisits(days = 30) {
  return useQuery<DailyStat[]>({
    queryKey: ['admin', 'analytics', 'daily-visits', days],
    queryFn: () => apiClient.get<DailyStat[]>(`/admin/analytics/daily-visits?days=${days}`),
    refetchInterval: 60000,
  });
}

export interface VisitEntry {
  path: string;
  userId: string | null;
  username: string | null;
  visitedAt: string;
}

export function useVisitHistory(options: { path?: string; loggedInOnly?: boolean; limit?: number } = {}) {
  const { path, loggedInOnly = true, limit = 50 } = options;
  const params = new URLSearchParams();
  if (path) params.set('path', path);
  params.set('loggedInOnly', String(loggedInOnly));
  params.set('limit', String(limit));

  return useQuery<VisitEntry[]>({
    queryKey: ['admin', 'analytics', 'visit-history', path ?? '', loggedInOnly, limit],
    queryFn: () => apiClient.get<VisitEntry[]>(`/admin/analytics/visit-history?${params.toString()}`),
    refetchInterval: 30000,
  });
}
