import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/api-client';
import { GuestbookEntry, GuestbookEntryCreateRequest } from '@/types/guestbook';

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
