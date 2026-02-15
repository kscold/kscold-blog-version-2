import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Post, PageResponse, PostCreateRequest, PostUpdateRequest } from '@/types/api';

interface UsePostsOptions {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export function usePosts(options: UsePostsOptions = {}) {
  const { page = 0, size = 10, sortBy = 'publishedAt', sortDirection = 'desc' } = options;

  return useQuery({
    queryKey: ['posts', { page, size, sortBy, sortDirection }],
    queryFn: () =>
      apiClient.get<PageResponse<Post>>(
        `/posts?page=${page}&size=${size}&sort=${sortBy},${sortDirection}`
      ),
  });
}

export function usePost(slug: string) {
  return useQuery({
    queryKey: ['posts', slug],
    queryFn: () => apiClient.get<Post>(`/posts/slug/${slug}`),
    enabled: !!slug,
  });
}

export function useFeaturedPosts(limit: number = 5) {
  return useQuery({
    queryKey: ['posts', 'featured', limit],
    queryFn: () => apiClient.get<Post[]>(`/posts/featured?limit=${limit}`),
  });
}

export function usePostsByCategory(categoryId: string, page: number = 0, size: number = 10) {
  return useQuery({
    queryKey: ['posts', 'category', categoryId, { page, size }],
    queryFn: () =>
      apiClient.get<PageResponse<Post>>(
        `/posts/category/${categoryId}?page=${page}&size=${size}`
      ),
    enabled: !!categoryId,
  });
}

export function usePostsByTag(tagId: string, page: number = 0, size: number = 10) {
  return useQuery({
    queryKey: ['posts', 'tag', tagId, { page, size }],
    queryFn: () =>
      apiClient.get<PageResponse<Post>>(`/posts/tag/${tagId}?page=${page}&size=${size}`),
    enabled: !!tagId,
  });
}

export function useSearchPosts(query: string, page: number = 0, size: number = 10) {
  return useQuery({
    queryKey: ['posts', 'search', query, { page, size }],
    queryFn: () =>
      apiClient.get<PageResponse<Post>>(
        `/posts/search?q=${encodeURIComponent(query)}&page=${page}&size=${size}`
      ),
    enabled: !!query && query.length > 0,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PostCreateRequest) => apiClient.post<Post>('/posts', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function useUpdatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PostUpdateRequest }) =>
      apiClient.put<Post>(`/posts/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['posts', variables.id] });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.delete<void>(`/posts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}
