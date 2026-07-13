'use client';

import Link from 'next/link';

interface SidebarMobileLink {
  label: string;
  href: string;
  highlighted?: boolean;
}

interface SidebarMobileNavProps {
  links: SidebarMobileLink[];
  onNavigate: () => void;
}

export function SidebarMobileNav({ links, onNavigate }: SidebarMobileNavProps) {
  return (
    <div className="lg:hidden pb-6 border-b border-surface-200/50 space-y-1 mt-2">
      {links.map(link => (
        <Link
          key={link.href}
          href={link.href}
          data-cy={`sidebar-link-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
          onClick={onNavigate}
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
  );
}
