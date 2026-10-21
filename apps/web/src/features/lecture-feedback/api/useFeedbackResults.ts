'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/api-client';
import type { FeedbackResponse } from '../model/questions';

export function useFeedbackResults() {
  return useQuery({
    queryKey: ['admin', 'lecture-feedback', 'hansalim'],
    queryFn: () => apiClient.get<FeedbackResponse[]>('/admin/lectures/hansalim/feedback'),
    retry: false,
    refetchInterval: 60000,
  });
}
