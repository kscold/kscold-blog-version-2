'use client';

import { motion } from 'framer-motion';
import { BlogContainer } from '@/widgets/blog/ui/BlogContainer';

export function BlogPageClient() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
        >
          <h1 className="text-5xl md:text-6xl font-sans font-black tracking-tighter text-surface-900 mb-6">
            Archive.
          </h1>
          <p className="text-lg text-surface-500 font-medium">
            개발하면서 배우고 느낀 것들을 기록합니다.
          </p>
        </motion.div>

        <BlogContainer />
      </div>
    </div>
  );
}
