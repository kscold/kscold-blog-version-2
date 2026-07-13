'use client';

import Link from 'next/link';
import { Skeleton } from '@/shared/ui/Skeleton';

interface SidebarTag {
  name: string;
  slug?: string;
  count: number;
}

interface SidebarTagsProps {
  tags: SidebarTag[];
  isLoading: boolean;
  onNavigate: () => void;
}

export function SidebarTags({ tags, isLoading, onNavigate }: SidebarTagsProps) {
  return (
    <div>
      <h2 className="text-xs font-bold text-surface-400 mb-4 tracking-[0.2em] uppercase">
        Popular Tags
      </h2>
      <div className="flex flex-wrap gap-2">
        {!isLoading ? (
          tags.length > 0 ? (
            tags.slice(0, 12).map(tag => (
              <Link
                key={tag.name}
                href={`/tags/${encodeURIComponent(tag.name)}`}
                onClick={onNavigate}
                className="group relative px-3 py-1.5 text-xs font-bold text-surface-500 bg-white border border-surface-200 rounded-lg overflow-hidden transition-all hover:text-surface-900 hover:border-surface-900"
              >
                <div className="absolute inset-0 bg-surface-50 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative z-10">#{tag.name}</span>
                {tag.count > 0 && (
                  <span className="relative z-10 ml-1 text-[10px] text-surface-400">
                    {tag.count}
                  </span>
                )}
              </Link>
            ))
          ) : (
            <p className="text-xs text-surface-400">태그가 없습니다</p>
          )
        ) : (
          <>
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-8 w-16 rounded-lg" />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
