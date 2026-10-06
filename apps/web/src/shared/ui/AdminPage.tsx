import Link from 'next/link';
import type { ReactNode } from 'react';

const WIDTH_CLASS = {
  narrow: 'max-w-4xl',
  default: 'max-w-6xl',
  wide: 'max-w-7xl',
} as const;

interface AdminPageProps {
  children: ReactNode;
  width?: keyof typeof WIDTH_CLASS;
  /** E2E가 화면 진입을 확인할 때 쓰는 식별자 */
  testId?: string;
}

/** 관리자 화면의 공통 바탕과 본문 폭. 화면마다 여백과 폭이 달라 보이지 않게 한다. */
export function AdminPage({ children, width = 'default', testId }: AdminPageProps) {
  return (
    <div data-cy={testId} className="min-h-screen bg-surface-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className={`mx-auto ${WIDTH_CLASS[width]} space-y-6`}>{children}</div>
    </div>
  );
}

interface AdminPageHeaderProps {
  title: string;
  eyebrow?: string;
  description?: ReactNode;
  actions?: ReactNode;
}

/** 관리자 화면의 제목 영역. 서체와 크기를 한 가지로 맞추고 주요 동작은 오른쪽에 모은다. */
export function AdminPageHeader({ title, eyebrow, description, actions }: AdminPageHeaderProps) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4 py-2">
      <div className="min-w-0 space-y-3">
        {eyebrow && (
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-surface-400">
            {eyebrow}
          </p>
        )}
        <h1 className="text-3xl font-black tracking-tight text-surface-900 sm:text-4xl">{title}</h1>
        {description && (
          <p className="max-w-2xl text-sm leading-6 text-surface-500">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

const ACTION_BASE =
  'inline-flex items-center justify-center rounded-[10px] px-5 py-2.5 text-sm font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-surface-900/50 focus:ring-offset-2';

const ACTION_VARIANT = {
  primary: 'bg-surface-900 text-white hover:bg-surface-800',
  secondary:
    'border border-surface-200 bg-white text-surface-700 hover:border-surface-300 hover:text-surface-900',
} as const;

interface AdminActionLinkProps {
  href: string;
  children: ReactNode;
  variant?: keyof typeof ACTION_VARIANT;
  testId?: string;
}

/** 다른 화면으로 넘어가는 주요 동작. 버튼과 같은 모양을 쓰되 링크로 남겨 새 탭으로도 열 수 있게 한다. */
export function AdminActionLink({
  href,
  children,
  variant = 'primary',
  testId,
}: AdminActionLinkProps) {
  return (
    <Link href={href} data-cy={testId} className={`${ACTION_BASE} ${ACTION_VARIANT[variant]}`}>
      {children}
    </Link>
  );
}

/** 관리자 화면에서 목록·표·폼을 담는 흰 카드. */
export const ADMIN_CARD_CLASS = 'rounded-3xl border border-surface-200 bg-white';
