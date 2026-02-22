'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useUiStore } from '@/store/uiStore';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';

export function Header() {
  const { user } = useAuthStore();
  const { toggleSidebar } = useUiStore();
  const { logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Blog', href: '/blog' },
    { label: 'Portfolio', href: '/portfolio' },
    { label: 'About', href: '/about' },
    { label: 'Chat', href: '/chat' },
  ];

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b ${
        isScrolled
          ? 'bg-white/80 backdrop-blur-xl border-surface-200 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]'
          : 'bg-white/50 backdrop-blur-lg border-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="px-6 sm:px-8 lg:px-12 h-16">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-4 sm:gap-8">
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-surface-100 transition-colors text-surface-900"
              aria-label="Toggle sidebar"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            <Link
              href="/"
              className="group relative flex items-center gap-2"
            >
              <span className="relative text-xl sm:text-2xl font-sans font-black tracking-tighter text-surface-900 z-10 group-hover:text-surface-600 transition-colors">
                KSCOLD
              </span>
            </Link>

            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative px-4 py-2 text-sm font-medium text-surface-500 hover:text-surface-900 transition-colors group overflow-hidden rounded-full"
                >
                  <span className="relative z-10">{item.label}</span>
                  <div className="absolute inset-0 bg-surface-100 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-surface-900 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                {user.role === 'ADMIN' && (
                  <Link
                    href="/admin"
                    className="hidden sm:block px-4 py-2 text-sm font-medium text-surface-900 hover:bg-surface-100 rounded-full transition-colors"
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="px-4 py-2 text-sm font-medium text-surface-500 hover:text-surface-900 transition-colors"
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
