import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/api-client';
import type { TagUsage } from '@/shared/model/types/blog';

export function useTagIndex(initialData?: TagUsage[]) {
  return useQuery({
    queryKey: ['tag-index'],
    queryFn: () => apiClient.get<TagUsage[]>('/tags/index'),
    staleTime: 1000 * 60 * 5,
    initialData,
  });
}
