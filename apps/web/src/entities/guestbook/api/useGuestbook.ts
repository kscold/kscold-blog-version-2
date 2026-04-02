import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/api-client';
import { PageResponse } from '@/types/api';
import { GuestbookEntry, GuestbookEntryCreateRequest } from '@/types/guestbook';

export function useGuestbookEntries(page: number = 0, size: number = 20) {
  return useQuery({
    queryKey: ['guestbook', { page, size }],
    queryFn: () =>
      apiClient.get<PageResponse<GuestbookEntry>>(`/guestbook?page=${page}&size=${size}`),
  });
}

export function useCreateGuestbookEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GuestbookEntryCreateRequest) =>
      apiClient.post<GuestbookEntry>('/guestbook', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guestbook'] });
    },
  });
}

export function useDeleteGuestbookEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (entryId: string) => apiClient.delete<void>(`/guestbook/${entryId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guestbook'] });
    },
  });
}
