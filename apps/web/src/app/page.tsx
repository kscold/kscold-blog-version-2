'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useFeaturedPosts } from '@/entities/post/api/usePosts';
import { PostCard } from '@/entities/post/ui/PostCard';
import { HeroSection } from '@/widgets/home/ui/HeroSection';

export default function HomePage() {
  const { data: featuredPosts, isLoading } = useFeaturedPosts(6);

  return (
    <main className="min-h-screen text-surface-900">
      <HeroSection />

      {/* Featured Posts Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-surface-50 relative border-t border-surface-200">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="flex items-end justify-between mb-20 border-b border-white/10 pb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div>
              <h2 className="text-4xl sm:text-5xl font-sans font-bold text-surface-900 mb-2 tracking-tight">
                Featured <span className="text-accent-dark">Posts</span>
              </h2>
              <p className="text-surface-500">엄선된 개발 이야기</p>
            </div>
            <Link
              href="/blog"
              className="hidden sm:block text-surface-500 hover:text-surface-900 transition-colors uppercase text-sm tracking-widest font-bold"
            >
              전체 보기
            </Link>
          </motion.div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-96 bg-white/50 border border-surface-200 rounded-3xl animate-pulse"
                />
              ))}
            </div>
          ) : featuredPosts && featuredPosts.length > 0 ? (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.1,
                  },
                },
              }}
            >
              {featuredPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <PostCard post={post} featured={index === 0} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-20 border border-surface-200 border-dashed rounded-3xl bg-white">
              <p className="text-lg text-surface-500 font-mono">작성된 포스트가 없습니다.</p>
            </div>
          )}
        </div>
      </section>

      {/* About Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-white border-t border-surface-200">
        <div className="max-w-5xl mx-auto">
          <div className="bg-surface-50 border border-surface-200 rounded-[2rem] p-12 text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-surface-100 opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
            <div className="relative z-10">
              <h2 className="text-3xl font-sans font-bold text-surface-900 mb-8 tracking-tight">
                Design Philosophy
              </h2>
              <p className="text-xl text-surface-600 leading-relaxed max-w-3xl mx-auto">
                {'\u201C'}단순함은 궁극의 정교함이다.{'\u201D'} <br />
                <span className="text-surface-900 font-semibold text-base mt-2 block">
                  Enjoying the Learning Curve.
                </span>
              </p>
              <div className="mt-12">
                <Link
                  href="/blog"
                  className="px-8 py-3 bg-surface-900 hover:bg-surface-800 text-white rounded-xl transition-colors font-bold shadow-lg"
                >
                  블로그 둘러보기
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
