import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import {
  VaultNote,
  VaultFolder,
  GraphData,
  PageResponse,
  VaultNoteCreateRequest,
  VaultNoteUpdateRequest,
} from '@/types/api';

export function useVaultFolders() {
  return useQuery({
    queryKey: ['vault', 'folders'],
    queryFn: () => apiClient.get<VaultFolder[]>('/vault/folders'),
  });
}

export function useVaultNotes(folderId: string, page: number = 0, size: number = 20) {
  return useQuery({
    queryKey: ['vault', 'notes', 'folder', folderId, { page, size }],
    queryFn: () =>
      apiClient.get<PageResponse<VaultNote>>(
        `/vault/notes/folder/${folderId}?page=${page}&size=${size}`
      ),
    enabled: !!folderId,
  });
}

export function useAllVaultNotes(page: number = 0, size: number = 50) {
  return useQuery({
    queryKey: ['vault', 'notes', { page, size }],
    queryFn: () => apiClient.get<PageResponse<VaultNote>>(`/vault/notes?page=${page}&size=${size}`),
  });
}

export function useVaultNote(slug: string) {
  return useQuery({
    queryKey: ['vault', 'notes', 'slug', slug],
    queryFn: () => apiClient.get<VaultNote>(`/vault/notes/slug/${slug}`),
    enabled: !!slug,
  });
}

export function useVaultBacklinks(noteId: string) {
  return useQuery({
    queryKey: ['vault', 'notes', noteId, 'backlinks'],
    queryFn: () => apiClient.get<VaultNote[]>(`/vault/notes/${noteId}/backlinks`),
    enabled: !!noteId,
  });
}

export function useVaultGraph() {
  return useQuery({
    queryKey: ['vault', 'graph'],
    queryFn: () => apiClient.get<GraphData>('/vault/notes/graph'),
    staleTime: 1000 * 60 * 5,
  });
}

export function useVaultSearch(query: string, page: number = 0) {
  return useQuery({
    queryKey: ['vault', 'search', query, page],
    queryFn: () =>
      apiClient.get<PageResponse<VaultNote>>(
        `/vault/notes/search?q=${encodeURIComponent(query)}&page=${page}`
      ),
    enabled: !!query && query.length > 0,
  });
}

export function useCreateVaultNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: VaultNoteCreateRequest) => apiClient.post<VaultNote>('/vault/notes', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vault'] });
    },
  });
}

export function useUpdateVaultNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: VaultNoteUpdateRequest }) =>
      apiClient.put<VaultNote>(`/vault/notes/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vault'] });
    },
  });
}

export function useDeleteVaultNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete<void>(`/vault/notes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vault'] });
    },
  });
}
