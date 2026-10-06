'use client';

import Link from 'next/link';
import {
  ADMIN_HOME,
  ADMIN_NAV_GROUPS,
  findActiveAdminHref,
  type AdminNavItem,
} from '@/shared/config/adminNavigation';

function navLinkClass(active: boolean) {
  return `block rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
    active
      ? 'bg-surface-900 text-white'
      : 'text-surface-600 hover:bg-surface-50 hover:text-surface-900'
  }`;
}

function AdminNavLink({ item, active }: { item: AdminNavItem; active: boolean }) {
  const shared = {
    'data-cy': item.sidebarTestId ?? `admin-nav-${item.key}`,
    'aria-current': active ? ('page' as const) : undefined,
    className: navLinkClass(active),
  };
  // 개인 문서는 공개 화면의 외부 스크립트를 이어받지 않도록 전체 페이지 이동으로 연다.
  if (item.hardNavigation) {
    return (
      <a href={item.href} {...shared}>
        {item.label}
      </a>
    );
  }
  return (
    <Link href={item.href} prefetch={false} {...shared}>
      {item.label}
    </Link>
  );
}

/** 관리자 화면에서는 공개 카테고리·태그 대신 관리 메뉴를 묶음별로 보여준다. */
export default function SidebarAdminNav({ pathname }: { pathname: string }) {
  const activeHref = findActiveAdminHref(pathname);

  return (
    <nav aria-label="관리자 메뉴" className="space-y-5">
      <AdminNavLink item={ADMIN_HOME} active={activeHref === ADMIN_HOME.href} />
      {ADMIN_NAV_GROUPS.map(group => (
        <div key={group.key} className="space-y-1.5">
          <p className="px-3 text-[11px] font-bold tracking-[0.18em] text-surface-400">
            {group.label}
          </p>
          <ul className="space-y-0.5">
            {group.items.map(item => (
              <li key={item.key}>
                <AdminNavLink item={item} active={activeHref === item.href} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}
