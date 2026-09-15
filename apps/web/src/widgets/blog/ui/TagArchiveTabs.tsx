import Link from 'next/link';
import type { TagArchiveData } from '../lib/loadTagArchive';
import { getTagViewPath, type TagArchiveType } from '../lib/tagArchiveView';

export function TagArchiveTabs({ basePath, sort, type, tag, initialPosts }: TagArchiveData) {
  const postCount = initialPosts.totalElements;
  const tabs: { value: TagArchiveType; label: string; count: number }[] = [
    { value: 'all', label: '전체', count: postCount + tag.feedCount },
    { value: 'blog', label: '블로그', count: postCount },
    { value: 'feed', label: '피드', count: tag.feedCount },
  ];
  return (
    <nav aria-label="태그 콘텐츠 구분" className="mb-6 flex flex-wrap gap-2">
      {tabs.map(tab => (
        <Link
          key={tab.value}
          href={getTagViewPath(basePath, { sort, type: tab.value })}
          prefetch={false}
          aria-current={type === tab.value ? 'page' : undefined}
          className={`inline-flex min-h-11 items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold ${
            type === tab.value
              ? 'bg-surface-900 text-white'
              : 'border border-surface-200 bg-white text-surface-600'
          }`}
        >
          {tab.label} <span>{tab.count}</span>
        </Link>
      ))}
    </nav>
  );
}
