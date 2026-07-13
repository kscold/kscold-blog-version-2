import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/api-client';
import { PageResponse } from '@/shared/model/types/api';
import { GuestbookEntry } from '@/shared/model/types/guestbook';

export function useGuestbookEntries(page: number = 0, size: number = 20) {
  return useQuery({
    queryKey: ['guestbook', { page, size }],
    queryFn: () =>
      apiClient.get<PageResponse<GuestbookEntry>>(`/guestbook?page=${page}&size=${size}`),
  });
}
