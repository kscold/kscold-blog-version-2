import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/api-client';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '@/shared/model/types/user';
import { useAuthStore } from '@/entities/user';

export function useAuth() {
  const queryClient = useQueryClient();
  const { user, hasHydrated, setUser } = useAuthStore();

  const { data: currentUser, isLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      return apiClient.get<User>('/auth/me');
    },
    enabled: hasHydrated && Boolean(user),
    retry: false,
  });

  useEffect(() => {
    if (currentUser) {
      setUser(currentUser);
    }
  }, [currentUser, setUser]);

  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => apiClient.post<AuthResponse>('/auth/login', data),
    onSuccess: data => {
      apiClient.establishSession();
      setUser(data.user);
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterRequest) => apiClient.post<AuthResponse>('/auth/register', data),
    onSuccess: data => {
      apiClient.establishSession();
      setUser(data.user);
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
  });

  const logout = () => apiClient.logout();

  return {
    currentUser,
    isLoading,
    isAuthenticated: !!currentUser,
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    register: registerMutation.mutate,
    registerAsync: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    registerError: registerMutation.error,
    logout,
  };
}
