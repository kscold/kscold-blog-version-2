'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export function LoginBrandHeader() {
  return (
    <motion.div
      className="mb-8 text-center sm:mb-12"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
    >
      <Link href="/" className="inline-block group">
        <h1 className="text-5xl font-sans font-black tracking-tighter mb-3 group-hover:scale-105 transition-transform">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-surface-900 via-surface-500 to-surface-900 bg-[size:200%_auto] animate-shimmer">
            KSCOLD
          </span>
        </h1>
        <p className="text-surface-500 text-sm tracking-wide font-medium">
          김승찬의 블로그, 일상과 기술 기록
        </p>
      </Link>
    </motion.div>
  );
}
