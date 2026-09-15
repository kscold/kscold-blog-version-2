import Link from 'next/link';
import type { TagArchiveData } from '../lib/loadTagArchive';
import { getTagViewPath } from '../lib/tagArchiveView';

export function TagArchiveToolbar({ basePath, sort, type }: TagArchiveData) {
  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
      <p className="text-sm text-surface-500" aria-live="polite">
        {sort === 'popular' ? '조회수가 높은 순' : '최근 발행한 순'}
      </p>
      <nav aria-label="태그 포스트 정렬" className="flex gap-2">
        {(['latest', 'popular'] as const).map(value => (
          <Link key={value} href={getTagViewPath(basePath, { sort: value, type })}
            prefetch={false} aria-current={sort === value ? 'page' : undefined}
            className={`inline-flex min-h-11 items-center rounded-xl px-4 py-2 text-sm font-bold transition-colors ${
              sort === value ? 'bg-surface-900 text-white' : 'border border-surface-200 bg-white text-surface-600 hover:bg-surface-100'
            }`}>
            {value === 'latest' ? '최신순' : '인기순'}
          </Link>
        ))}
      </nav>
    </div>
  );
}
