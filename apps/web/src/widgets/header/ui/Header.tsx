'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useUiStore } from '@/shared/model/uiStore';
import { useLogout } from '@/entities/user/model/useLogout';
import { useState, useEffect } from 'react';
import { useViewer } from '@/entities/user/model/useViewer';
import { usePerformanceMode } from '@/shared/model/usePerformanceMode';

export function Header() {
  const { user, isAuthenticated, role } = useViewer();
  const { toggleSidebar } = useUiStore();
  const logout = useLogout();
  const [isScrolled, setIsScrolled] = useState(false);
  const { allowRichEffects, isTouchDevice } = usePerformanceMode();

  useEffect(() => {
    const handleScroll = () => {
      const next = window.scrollY > 20;
      setIsScrolled(prev => (prev === next ? prev : next));
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Blog', href: '/blog' },
    { label: 'Feed', href: '/feed' },
    { label: 'Vault', href: '/vault' },
    { label: 'Guestbook', href: '/guestbook' },
    { label: 'Info', href: '/info' },
  ];

  const headerMotionProps = allowRichEffects
    ? {
        initial: { y: -100 },
        animate: { y: 0 },
        transition: { type: 'spring', stiffness: 300, damping: 30 },
      }
    : {};

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isTouchDevice
          ? isScrolled
            ? 'bg-white/95 shadow-sm border-b border-surface-100'
            : 'bg-white/92 border-b border-surface-100/80'
          : isScrolled
            ? 'bg-white/80 backdrop-blur-xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]'
            : 'bg-white/50 backdrop-blur-lg'
      }`}
      {...headerMotionProps}
    >
      <div className="px-4 sm:px-8 lg:px-12 h-16">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-3 sm:gap-8 min-w-0">
            <button
              onClick={toggleSidebar}
              data-cy="sidebar-toggle"
              className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-surface-100 transition-colors text-surface-900"
              aria-label="Toggle sidebar"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            <Link href="/" className="group relative flex items-center gap-2 sm:gap-3 min-w-0">
              <Image
                src="/logo.svg"
                alt="KSCOLD Logo"
                width={32}
                height={32}
                className="group-hover:scale-110 transition-transform duration-500 will-change-transform"
              />
              <span className="relative text-lg sm:text-2xl font-sans font-black tracking-tighter text-surface-900 z-10 group-hover:text-surface-600 transition-colors truncate">
                KSCOLD
              </span>
            </Link>

            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  data-cy={`nav-link-${item.label.toLowerCase()}`}
                  className="relative px-4 py-2 text-sm font-medium text-surface-500 hover:text-surface-900 transition-colors group overflow-hidden rounded-full"
                >
                  <span className="relative z-10">{item.label}</span>
                  <div className="absolute inset-0 bg-surface-100 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-surface-900 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {isAuthenticated ? (
              <div className="flex items-center gap-2 sm:gap-4">
                {role === 'ADMIN' && (
                  <Link
                    href="/admin"
                    data-cy="admin-header-link"
                    className="hidden sm:inline-flex items-center rounded-full border border-surface-200 px-3 py-1.5 text-xs font-semibold text-surface-900 hover:bg-surface-100 transition-colors sm:px-4 sm:py-2 sm:text-sm"
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="px-1.5 py-1.5 text-[11px] font-medium text-surface-500 hover:text-surface-900 transition-colors sm:px-4 sm:py-2 sm:text-sm"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-5 py-2 text-xs sm:text-sm font-bold text-white bg-surface-900 hover:bg-surface-800 transition-colors rounded-full"
              >
                LOGIN
              </Link>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
}
