export const PUBLIC_SEARCH_QUERY_MAX_LENGTH = 120;

export function normalizePublicSearchQuery(query: string): string {
  return query.trim();
}
