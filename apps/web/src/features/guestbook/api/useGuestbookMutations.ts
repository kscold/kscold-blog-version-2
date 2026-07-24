import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/api-client';
import {
  GuestbookEntry,
  GuestbookEntryCreateRequest,
  GuestbookReplyRequest,
} from '@/shared/model/types/guestbook';

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

/** 방명록 답글. 블로그 주인(admin)만 호출할 수 있음 */
export function useReplyGuestbookEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ entryId, content }: { entryId: string } & GuestbookReplyRequest) =>
      apiClient.post<GuestbookEntry>(`/guestbook/${entryId}/reply`, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guestbook'] });
    },
  });
}
