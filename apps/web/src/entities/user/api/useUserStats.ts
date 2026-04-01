import { useQuery } from '@tanstack/react-query';
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
