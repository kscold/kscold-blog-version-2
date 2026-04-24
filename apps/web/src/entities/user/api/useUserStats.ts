import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/shared/api/api-client';

export interface DailySignup {
  date: string;
  count: number;
}

export interface RecentUser {
  id: string;
  username: string;
  displayName: string;
  email: string;
  avatar: string | null;
  role: 'ADMIN' | 'USER';
  createdAt: string;
  deleted: boolean;
}

export interface UserStats {
  totalUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  dailySignups: DailySignup[];
  recentUsers: RecentUser[];
}

export function useUserStats() {
  return useQuery<UserStats>({
    queryKey: ['admin', 'users', 'stats'],
    queryFn: () => apiClient.get<UserStats>('/admin/users/stats'),
    refetchInterval: 60000,
  });
}

export function useSoftDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => apiClient.delete<void>(`/admin/users/${userId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users', 'stats'] }),
  });
}

export function useHardDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => apiClient.delete<void>(`/admin/users/${userId}/permanent`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users', 'stats'] }),
  });
}
