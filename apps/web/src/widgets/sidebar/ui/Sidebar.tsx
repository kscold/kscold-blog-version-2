'use client';

import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { useCategories } from '@/entities/category';
import { useTagIndex } from '@/entities/tag';
import { useUiStore } from '@/shared/model/uiStore';
import { useViewer } from '@/entities/user';
import { usePerformanceMode } from '@/shared/model/usePerformanceMode';
import { isSystemTagName } from '@/shared/lib/tags';
import { isAdminPath } from '@/shared/config/adminNavigation';
import { SidebarMobileNav } from '@/widgets/sidebar/ui/SidebarMobileNav';
import { SidebarCategories } from '@/widgets/sidebar/ui/SidebarCategories';
import { SidebarTags } from '@/widgets/sidebar/ui/SidebarTags';

// 관리 메뉴는 관리자가 관리자 화면에 들어왔을 때만 내려받아 공개 화면 번들에 싣지 않는다.
const SidebarAdminNav = dynamic(() => import('@/widgets/sidebar/ui/SidebarAdminNav'));

export function Sidebar() {
  const { sidebarOpen, setSidebarOpen } = useUiStore();
  const { role } = useViewer();
  const { isTouchDevice, isDesktopViewport, allowRichEffects } = usePerformanceMode();
  const pathname = usePathname();
  const isVaultPage = pathname.startsWith('/vault');
  const showAdminNav = role === 'ADMIN' && isAdminPath(pathname);
  // 관리자 화면에서는 공개 카테고리·태그를 그리지 않으므로 불러오지도 않는다.
  const shouldLoadSidebarData =
    !showAdminNav && (sidebarOpen || (isDesktopViewport && !isVaultPage));
  const { data: categories } = useCategories(undefined, shouldLoadSidebarData);
  const { data: tagIndex, isLoading: isTagsLoading } = useTagIndex(
    undefined,
    shouldLoadSidebarData
  );

  const tags = (tagIndex ?? []).filter(
    tag => !isSystemTagName(tag.name) && tag.totalCount > 0
  );
  const useSolidSurface = isTouchDevice || !allowRichEffects;
  const closeSidebar = () => setSidebarOpen(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname, setSidebarOpen]);

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
    useSolidSurface
      ? 'bg-white border border-surface-200 rounded-2xl shadow-md'
      : 'bg-white/60 backdrop-blur-xl border border-surface-200/50 rounded-2xl shadow-sm'
  }`;

  const innerContent = (
    <div className="p-6 space-y-8 relative">
      {/* 모바일 네비게이션 링크 */}
      <SidebarMobileNav links={mobileLinks} />

      {showAdminNav ? (
        <SidebarAdminNav pathname={pathname} />
      ) : (
        <>
          {role === 'ADMIN' && (
            <nav aria-label="관리자 메뉴" className="space-y-2 border-b border-surface-200 pb-6">
              <p className="text-xs font-semibold tracking-wide text-surface-500">ADMIN</p>
              {[
                { href: '/admin/documents', label: '개인 문서함', key: 'documents' },
                { href: '/admin/documents/resumes', label: '이력서 관리', key: 'resumes' },
                { href: '/admin/documents/sources', label: '경력 소스 관리', key: 'sources' },
                { href: '/admin/documents/stories', label: '스토리 관리', key: 'stories' },
              ].map(link => (
                <a
                  key={link.href}
                  href={link.href}
                  data-cy={`admin-${link.key}-sidebar-link`}
                  aria-current={pathname === link.href ? 'page' : undefined}
                  className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? 'bg-surface-900 text-white'
                      : 'text-surface-600 hover:bg-surface-50 hover:text-surface-900'
                  }`}
                >
                  {link.label}
                </a>
              ))}
            </nav>
          )}

          <SidebarCategories categories={categories} />

          <SidebarTags tags={tags} isLoading={isTagsLoading} />
        </>
      )}
    </div>
  );

  return (
    <>
      {/* 모바일 딤 오버레이 */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className={`fixed inset-0 z-40 lg:hidden ${useSolidSurface ? 'bg-surface-900/20' : 'bg-surface-900/10 backdrop-blur-sm'}`}
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

      {/* 데스크톱 사이드바는 Vault 페이지를 제외하고 표시한다. */}
      {!isVaultPage && (
        <aside className={`${asideBaseClass} hidden lg:block`}>{innerContent}</aside>
      )}
    </>
  );
}
