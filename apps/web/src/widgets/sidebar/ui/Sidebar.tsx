'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useCategories } from '@/entities/category';
import { useTags } from '@/entities/tag';
import { useFeedTags } from '@/entities/feed';
import { useUiStore } from '@/shared/model/uiStore';
import { useViewer } from '@/entities/user';
import { usePerformanceMode } from '@/shared/model/usePerformanceMode';
import { isSystemTagName } from '@/shared/lib/tags';
import { SidebarMobileNav } from '@/widgets/sidebar/ui/SidebarMobileNav';
import { SidebarCategories } from '@/widgets/sidebar/ui/SidebarCategories';
import { SidebarTags } from '@/widgets/sidebar/ui/SidebarTags';

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
    { label: 'Product', href: '/product' },
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
      <SidebarMobileNav links={mobileLinks} onNavigate={closeSidebar} />

      <SidebarCategories categories={categories} onNavigate={closeSidebar} />

      <SidebarTags tags={tags} isLoading={isTagsLoading} onNavigate={closeSidebar} />
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
