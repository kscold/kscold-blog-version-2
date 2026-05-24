import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/api-client';
import { Category } from '@/types/blog';

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => apiClient.get<Category[]>('/categories'),
  });
}

export function useCategory(id: string) {
  return useQuery({
    queryKey: ['categories', id],
    queryFn: () => apiClient.get<Category>(`/categories/${id}`),
    enabled: !!id,
  });
}

export function useCategoryBySlug(slug: string) {
  return useQuery({
    queryKey: ['categories', 'slug', slug],
    queryFn: () => apiClient.get<Category>(`/categories/slug/${slug}`),
    enabled: !!slug,
  });
}

export function useRootCategories() {
  return useQuery({
    queryKey: ['categories', 'root'],
    queryFn: () => apiClient.get<Category[]>('/categories/root'),
  });
}

