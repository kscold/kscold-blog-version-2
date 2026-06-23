'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useCategories } from '@/entities/category/api/useCategories';
import { useTags } from '@/entities/tag/api/useTags';
import { useFeedTags } from '@/entities/feed/api/useFeeds';
import { useUiStore } from '@/shared/model/uiStore';
import { useViewer } from '@/entities/user/model/useViewer';
import { Skeleton } from '@/shared/ui/Skeleton';
import { usePerformanceMode } from '@/shared/model/usePerformanceMode';
import { isSystemTagName } from '@/shared/lib/tags';
import { Category } from '@/types/blog';

function CategoryTree({ categories, depth = 0, onNavigate }: { categories: Category[]; depth?: number; onNavigate?: () => void }) {
  const rootCategories = categories.filter(cat => cat.depth === depth);

  return (
    <ul className={depth > 0 ? 'ml-4 mt-1 space-y-1' : 'space-y-1'}>
      {rootCategories.map(category => {
        const children = categories.filter(
          cat => cat.parent === category.id && cat.depth === depth + 1
        );

        return (
          <li key={category.id}>
            <Link
              href={`/blog/${category.slug}`}
              onClick={onNavigate}
              className="group flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all duration-300 hover:bg-white/5 hover:shadow-[inset_0_0_20px_rgba(6,182,212,0.1)] relative overflow-hidden"
            >
              <div className="absolute left-0 w-1 h-0 bg-surface-900 group-hover:h-full transition-all duration-300 top-1/2 -translate-y-1/2 rounded-full opacity-0 group-hover:opacity-100" />
              {category.icon && (
                <span className="text-surface-400 group-hover:text-surface-900 transition-colors relative z-10">
                  {category.icon}
                </span>
              )}
              <span className="flex-1 text-surface-600 group-hover:text-surface-900 transition-colors font-medium tracking-wide relative z-10">
                {category.name}
              </span>
              <span className="text-[10px] text-surface-400 group-hover:text-surface-900 font-mono relative z-10">
                {category.postCount}
              </span>
            </Link>
            {children.length > 0 && <CategoryTree categories={categories} depth={depth + 1} onNavigate={onNavigate} />}
          </li>
        );
      })}
    </ul>
  );
}

export function Sidebar() {
  const { data: categories } = useCategories();
  const { sidebarOpen, setSidebarOpen } = useUiStore();
  const { data: blogTags } = useTags();
  const { data: feedTagsRaw } = useFeedTags();

  const tags = (() => {
    const map = new Map<string, { name: string; slug?: string; count: number }>();
    blogTags
      ?.filter(tag => !isSystemTagName(tag.name))
      .forEach(t => map.set(t.name, { name: t.name, slug: t.slug, count: t.postCount }));
    feedTagsRaw?.forEach(ft => {
      if (isSystemTagName(ft.name)) return;
      const existing = map.get(ft.name);
      if (existing) {
        map.set(ft.name, { ...existing, count: existing.count + ft.count });
      } else {
        map.set(ft.name, { name: ft.name, count: ft.count });
      }
    });
    return [...map.values()].sort((a, b) => b.count - a.count);
  })();

  const isTagsLoading = !blogTags && !feedTagsRaw;
  const { role } = useViewer();
  const { isTouchDevice } = usePerformanceMode();
  const closeSidebar = () => setSidebarOpen(false);
  const pathname = usePathname();
  const isVaultPage = pathname.startsWith('/vault');

  const mobileLinks = [
    ...(role === 'ADMIN' ? [{ label: 'Admin', href: '/admin', highlighted: true }] : []),
    { label: 'Home', href: '/' },
    { label: 'Blog', href: '/blog' },
    { label: 'Feed', href: '/feed' },
    { label: 'Admin Night', href: '/admin-night' },
    { label: 'Vault', href: '/vault' },
    { label: 'Guestbook', href: '/guestbook' },
    { label: 'Info', href: '/info' },
  ];

  const asideBaseClass = `fixed top-[88px] left-4 bottom-4 w-56 z-40 overflow-y-auto ${
    isTouchDevice
      ? 'bg-white border border-surface-200 rounded-2xl shadow-md'
      : 'bg-white/60 backdrop-blur-xl border border-surface-200/50 rounded-2xl shadow-sm'
  }`;

  const innerContent = (
    <div className="p-6 space-y-8 relative">
      {/* 모바일 네비게이션 링크 */}
      <div className="lg:hidden pb-6 border-b border-surface-200/50 space-y-1 mt-2">
        {mobileLinks.map(link => (
          <Link
            key={link.href}
            href={link.href}
            data-cy={`sidebar-link-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
            onClick={closeSidebar}
            className={`block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              link.highlighted
                ? 'bg-surface-900 text-white hover:bg-surface-800'
                : 'text-surface-600 hover:text-surface-900 hover:bg-surface-50'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>

      <div>
        <h2 className="text-xs font-bold text-surface-400 mb-4 tracking-[0.2em] uppercase">
          Categories
        </h2>
        {categories ? (
          <CategoryTree categories={categories} onNavigate={closeSidebar} />
        ) : (
          <div className="space-y-3">
            <Skeleton className="h-4 w-4/5 rounded-md" />
            <Skeleton className="h-4 w-3/5 rounded-md" />
            <Skeleton className="h-4 w-2/3 rounded-md" />
          </div>
        )}
      </div>

      <div>
        <h2 className="text-xs font-bold text-surface-400 mb-4 tracking-[0.2em] uppercase">
          Popular Tags
        </h2>
        <div className="flex flex-wrap gap-2">
          {!isTagsLoading ? (
            tags.length > 0 ? (
              tags.slice(0, 12).map(tag => (
                <Link
                  key={tag.name}
                  href={`/tags/${encodeURIComponent(tag.name)}`}
                  onClick={closeSidebar}
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
    </div>
  );

  return (
    <>
      {/* 모바일 딤 오버레이 */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className={`fixed inset-0 z-40 lg:hidden ${isTouchDevice ? 'bg-surface-900/20' : 'bg-surface-900/10 backdrop-blur-sm'}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeSidebar}
          />
        )}
      </AnimatePresence>

      {/* 모바일 사이드바: 슬라이드 인/아웃 */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            className={`${asideBaseClass} lg:hidden`}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 40, mass: 0.6 }}
          >
            {innerContent}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* 데스크탑 사이드바: 항상 렌더링, Vault 페이지에서는 숨김 */}
      {!isVaultPage && (
        <aside className={`${asideBaseClass} hidden lg:block`}>
          {innerContent}
        </aside>
      )}
    </>
  );
}
