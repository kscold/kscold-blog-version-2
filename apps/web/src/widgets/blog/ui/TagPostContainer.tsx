'use client';

import Link from 'next/link';
import type { TagArchiveData } from '../lib/loadTagArchive';
import { TagArchiveToolbar } from './TagArchiveToolbar';
import { TagArchiveTabs } from './TagArchiveTabs';
import { TagFeedSection } from './TagFeedSection';
import { TagBlogSection } from './TagBlogSection';

export function TagPostContainer(archive: TagArchiveData) {
  const { tag, initialPosts, type } = archive;
  return (
    <div className="min-h-screen bg-surface-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <nav
          className="mb-8 flex items-center gap-2 text-sm text-surface-500"
          aria-label="태그 경로"
        >
          <Link href="/blog" className="hover:text-surface-900 transition-colors">
            Blog
          </Link>
          <span className="text-surface-300">/</span>
          <span className="text-surface-900 font-medium">#{tag.name}</span>
        </nav>
        <header className="mb-8">
          <h1 className="text-5xl font-sans font-black tracking-tight text-surface-900 mb-2">
            #{tag.name}
          </h1>
          <p className="text-sm text-surface-500">
            전체 {initialPosts.totalElements + tag.feedCount}개 · 블로그{' '}
            {initialPosts.totalElements}편 · 피드 {tag.feedCount}개
          </p>
        </header>
        <TagArchiveTabs {...archive} />
        <TagArchiveToolbar {...archive} />
        {type !== 'feed' && <TagBlogSection {...archive} />}
        {type !== 'blog' && <TagFeedSection {...archive} />}
      </div>
    </div>
  );
}
