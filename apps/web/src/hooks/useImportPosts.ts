import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Post, Tag, PostCreateRequest } from '@/types/api';

export function useResolveTag() {
  return useMutation({
    mutationFn: (name: string) => apiClient.post<Tag>('/tags/find-or-create', { name }),
  });
}

export function useCheckSlugExists() {
  return useMutation({
    mutationFn: (slug: string) => apiClient.get<boolean>(`/posts/exists/slug/${slug}`),
  });
}

export function useImportPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PostCreateRequest) => apiClient.post<Post>('/posts', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}
