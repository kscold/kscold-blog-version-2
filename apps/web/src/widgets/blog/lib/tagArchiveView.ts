export type TagArchiveType = 'all' | 'blog' | 'feed';

export interface TagArchiveQuery {
  sort?: string | string[];
  type?: string | string[];
  feedPage?: string | string[];
}

export function getTagViewPath(
  basePath: string,
  options: {
    sort: 'latest' | 'popular';
    type: TagArchiveType;
    feedPage?: number;
  }
) {
  const params = new URLSearchParams();
  if (options.sort === 'popular') params.set('sort', 'popular');
  if (options.type !== 'all') params.set('type', options.type);
  if (options.feedPage && options.feedPage > 1) params.set('feedPage', String(options.feedPage));
  return params.size ? `${basePath}?${params}` : basePath;
}
