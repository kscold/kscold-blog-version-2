import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/shared/api/api-client';
import { User } from '@/types/user';

export interface UpdateProfilePayload {
  displayName?: string;
  bio?: string;
  avatar?: string;
  socialLinks?: Record<string, string>;
  techStack?: string[];
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateProfilePayload) =>
      apiClient.patch<User>('/users/me/profile', data),
    onSuccess: updated => {
      qc.setQueryData(['auth', 'me'], updated);
    },
  });
}

export function useTechStacks() {
  return useQuery<string[]>({
    queryKey: ['users', 'tech-stacks'],
    queryFn: () => apiClient.get<string[]>('/users/tech-stacks'),
    staleTime: 1000 * 60 * 5,
  });
}

export interface AdminUser {
  id: string;
  email: string;
  username: string;
  displayName: string;
  role: 'ADMIN' | 'USER';
  avatar?: string;
  bio?: string;
  socialLinks?: Record<string, string>;
  techStack?: string[];
  createdAt: string;
  deleted: boolean;
}

export function useAdminUsers() {
  return useQuery<AdminUser[]>({
    queryKey: ['admin', 'users', 'list'],
    queryFn: () => apiClient.get<AdminUser[]>('/admin/users'),
  });
}

export function useAdminUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UpdateProfilePayload }) =>
      apiClient.patch<User>(`/admin/users/${userId}/profile`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users', 'list'] });
      qc.invalidateQueries({ queryKey: ['admin', 'users', 'stats'] });
    },
  });
}
