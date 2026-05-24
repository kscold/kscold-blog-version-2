import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/api-client';
import { Tag } from '@/types/blog';

export function useTags() {
  return useQuery({
    queryKey: ['tags'],
    queryFn: () => apiClient.get<Tag[]>('/tags'),
  });
}
