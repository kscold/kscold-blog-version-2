import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/api-client';
import type { GitHubOverview } from '../model/types';

export function useGitHubOverview(username: string) {
  return useQuery({
    queryKey: ['github', username],
    queryFn: () => apiClient.get<GitHubOverview>(`/github/${username}`),
    staleTime: 1000 * 60 * 30,
    enabled: !!username,
  });
}
