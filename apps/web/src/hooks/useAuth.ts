import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '@/types/api';
import { useAuthStore } from '@/store/authStore';

export function useAuth() {
  const queryClient = useQueryClient();
  const { setUser, setToken, clearAuth } = useAuthStore();

  const { data: currentUser, isLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const token = apiClient.getToken();
      if (!token) return null;
      return apiClient.get<User>('/auth/me');
    },
    enabled: !!apiClient.getToken(),
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) =>
      apiClient.post<AuthResponse>('/auth/login', data),
    onSuccess: (data) => {
      apiClient.setToken(data.accessToken);
      setToken(data.accessToken);
      setUser(data.user);
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterRequest) =>
      apiClient.post<AuthResponse>('/auth/register', data),
    onSuccess: (data) => {
      apiClient.setToken(data.accessToken);
      setToken(data.accessToken);
      setUser(data.user);
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
  });

  const logout = () => {
    apiClient.removeToken();
    clearAuth();
    queryClient.clear();
  };

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
