'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import type { TagUsage } from '@/shared/model/types/blog';
import { Skeleton } from '@/shared/ui/Skeleton';

interface SidebarTagsProps {
  tags: TagUsage[];
  isLoading: boolean;
}

const UNCATEGORIZED = '기타';
const MAX_VISIBLE_TAGS = 12;

export function SidebarTags({ tags, isLoading }: SidebarTagsProps) {
  const groups = useMemo(() => {
    const byCategory = new Map<string, TagUsage[]>();
    tags.slice(0, MAX_VISIBLE_TAGS).forEach(tag => {
      const key = tag.categoryName || UNCATEGORIZED;
      const bucket = byCategory.get(key);
      if (bucket) bucket.push(tag);
      else byCategory.set(key, [tag]);
    });

    return [...byCategory.entries()]
      .map(([name, items]) => ({
        name,
        items,
        weight: items.reduce((sum, tag) => sum + tag.totalCount, 0),
      }))
      .sort((a, b) => {
        if (a.name === UNCATEGORIZED && b.name !== UNCATEGORIZED) return 1;
        if (b.name === UNCATEGORIZED && a.name !== UNCATEGORIZED) return -1;
        return b.weight - a.weight || a.name.localeCompare(b.name, 'ko');
      });
  }, [tags]);

  return (
    <div>
      <h2 className="text-xs font-bold text-surface-600 mb-4 tracking-[0.2em] uppercase">
        Popular Tags
      </h2>

      {isLoading ? (
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-8 w-16 rounded-lg" />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <p className="text-xs text-surface-600">태그가 없습니다</p>
      ) : (
        <div className="space-y-4">
          {groups.map(group => (
            <div key={group.name}>
              <p className="mb-2 text-[10px] font-bold tracking-[0.16em] text-surface-600">
                {group.name}
              </p>
              <div className="flex flex-wrap gap-2">
                {group.items.map(tag => (
                  <Link
                    key={tag.name}
                    href={
                      tag.slug && tag.postCount > 0
                        ? `/blog/tags/${encodeURIComponent(tag.slug)}`
                        : `/tags/${encodeURIComponent(tag.name)}`
                    }
                    prefetch={false}
                    className="group relative overflow-hidden rounded-lg border border-surface-200 bg-white px-3 py-1.5 text-xs font-bold text-surface-500 transition-all hover:border-surface-900 hover:text-surface-900"
                  >
                    <span className="absolute inset-0 bg-surface-50 opacity-0 transition-opacity group-hover:opacity-100" />
                    <span className="relative z-10">#{tag.name}</span>
                    <span className="relative z-10 ml-1 text-[10px] text-surface-600">
                      {tag.totalCount}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
