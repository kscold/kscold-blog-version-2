import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/api-client';
import {
  GraphData,
  VaultBacklink,
  VaultFolder,
  VaultNote,
  VaultNoteStats,
  VaultNoteTitle,
  VaultSearchResult,
} from '@/shared/model/types/vault';
import { PageResponse } from '@/shared/model/types/api';

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

export function useVaultNote(slug: string, initialData?: VaultNote) {
  return useQuery({
    queryKey: ['vault', 'notes', 'slug', slug],
    queryFn: () => apiClient.get<VaultNote>(`/vault/notes/slug/${encodeURIComponent(slug)}`),
    enabled: !!slug,
    initialData,
  });
}

export function useVaultBacklinks(noteId: string) {
  return useQuery({
    queryKey: ['vault', 'notes', noteId, 'backlinks'],
    queryFn: () =>
      apiClient.get<VaultBacklink[]>(`/vault/notes/${noteId}/backlinks/summary`),
    enabled: !!noteId,
  });
}

export function useVaultGraph(enabled = true) {
  return useQuery({
    queryKey: ['vault', 'graph'],
    queryFn: () => apiClient.get<GraphData>('/vault/notes/graph'),
    enabled,
    staleTime: 1000 * 60 * 5,
  });
}

export function useVaultTitleIndex() {
  return useQuery({
    queryKey: ['vault', 'title-index'],
    queryFn: () => apiClient.get<VaultNoteTitle[]>('/vault/notes/title-index'),
    staleTime: 1000 * 60 * 5,
  });
}

export function useVaultStats() {
  return useQuery({
    queryKey: ['vault', 'stats'],
    queryFn: () => apiClient.get<VaultNoteStats>('/vault/notes/stats'),
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

export function useVaultSemanticSearch(query: string, activeFolderName: string) {
  return useQuery({
    queryKey: ['vault', 'semantic-search', query, activeFolderName],
    queryFn: () =>
      apiClient.get<VaultSearchResult[]>('/vault/agent/search', {
        params: { q: query, activeFolderName, limit: 8 },
      }),
    enabled: query.length >= 2,
    staleTime: 1000 * 60 * 5,
  });
}

export function useVaultNoteById(id: string) {
  return useQuery({
    queryKey: ['vault', 'notes', 'id', id],
    queryFn: () => apiClient.get<VaultNote>(`/vault/notes/${id}`),
    enabled: !!id,
  });
}
