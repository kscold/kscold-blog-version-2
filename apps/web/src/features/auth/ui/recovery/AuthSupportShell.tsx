'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import type { ReactNode } from 'react';

interface AuthSupportShellProps {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}

export function AuthSupportShell({
  eyebrow,
  title,
  description,
  children,
}: AuthSupportShellProps) {
  return (
    <div className="relative flex min-h-screen items-start justify-center overflow-hidden bg-surface-50 px-4 pb-10 pt-24 sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-surface-50 to-surface-100" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02]" />

      <motion.div
        className="relative z-10 w-full max-w-[460px]"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="mb-8 text-center sm:mb-10">
          <Link href="/" className="inline-block group">
            <h1 className="mb-3 text-5xl font-black tracking-tighter transition-transform group-hover:scale-[1.02]">
              <span className="bg-gradient-to-r from-surface-900 via-surface-500 to-surface-900 bg-[size:200%_auto] bg-clip-text text-transparent animate-shimmer">
                KSCOLD
              </span>
            </h1>
            <p className="text-sm font-medium tracking-[0.12em] text-surface-500">
              ACCOUNT SUPPORT
            </p>
          </Link>
        </div>

        <div className="rounded-[20px] border border-surface-200/70 bg-white/85 p-6 shadow-[0_8px_32px_-8px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-surface-400">
            {eyebrow}
          </p>
          <h1 className="text-[2rem] font-black tracking-[-0.03em] text-surface-900">{title}</h1>
          <p className="mt-3 text-[15px] leading-7 text-surface-500">{description}</p>
          <div className="mt-8">{children}</div>
        </div>
      </motion.div>
    </div>
  );
}
