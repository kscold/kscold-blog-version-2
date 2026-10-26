import { apiClient } from '@/shared/api/api-client';

export function checkPostSlugExists(slug: string) {
  return apiClient.get<boolean>(`/posts/exists/slug/${encodeURIComponent(slug)}`);
}
