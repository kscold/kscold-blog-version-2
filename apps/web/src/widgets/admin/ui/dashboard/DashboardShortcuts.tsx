import Link from 'next/link';
import { ADMIN_NAV_GROUPS, type AdminNavItem } from '@/shared/config/adminNavigation';

const LINK_CLASS =
  'block rounded-xl px-3 py-2.5 transition-colors hover:bg-surface-50 focus:outline-none focus:ring-2 focus:ring-surface-900/40';

function ShortcutLink({ item }: { item: AdminNavItem }) {
  const content = (
    <>
      <span className="block text-sm font-bold text-surface-900">{item.label}</span>
      <span className="mt-0.5 block text-xs leading-5 text-surface-500 [overflow-wrap:anywhere]">
        {item.description}
      </span>
    </>
  );
  // 개인 문서로 들어갈 때는 공개 화면의 외부 스크립트를 이어받지 않도록 전체 페이지 이동으로 연다.
  if (item.hardNavigation) {
    return (
      <a href={item.href} data-testid={item.dashboardTestId} className={LINK_CLASS}>
        {content}
      </a>
    );
  }
  return (
    <Link href={item.href} data-testid={item.dashboardTestId} className={LINK_CLASS}>
      {content}
    </Link>
  );
}

/** 관리 화면 전체를 묶음별로 훑어보는 바로가기. 사이드바가 접히는 좁은 화면에서 길잡이 역할을 한다. */
export function DashboardShortcuts() {
  return (
    <section aria-labelledby="dashboard-shortcuts-title" className="space-y-4">
      <h2 id="dashboard-shortcuts-title" className="text-lg font-black text-surface-900">
        관리 화면 바로가기
      </h2>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {ADMIN_NAV_GROUPS.map(group => (
          <div key={group.key} className="rounded-3xl border border-surface-200 bg-white p-4">
            <p className="px-3 text-[11px] font-bold tracking-[0.18em] text-surface-400">
              {group.label}
            </p>
            <ul className="mt-2">
              {group.items
                .filter(item => !item.nested)
                .map(item => (
                  <li key={item.key}>
                    <ShortcutLink item={item} />
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
