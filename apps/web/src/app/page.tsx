'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useFeaturedPosts } from '@/hooks/usePosts';
import { PostCard } from '@/components/blog/PostCard';

export default function HomePage() {
  const { data: featuredPosts, isLoading } = useFeaturedPosts(6);

  return (
    <main className="min-h-screen text-surface-900">
      {/* Hero Section */}
      <section className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden">
        {/* Background elements moved to layout.tsx */ }

        <motion.div
          className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center gap-12 text-center my-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 1.2, delay: 0.2, ease: [0.76, 0, 0.24, 1] }}
             className="inline-block"
          >
             <span className="px-5 py-2.5 rounded-full border border-surface-200/60 bg-white/60 backdrop-blur-md text-surface-900 text-xs font-bold tracking-[0.2em] shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex items-center gap-2 transition-all hover:bg-white hover:shadow-md cursor-default">
                <span className="w-1.5 h-1.5 rounded-full bg-surface-900 animate-pulse shadow-[0_0_8px_rgba(15,23,42,0.4)]" />
                FULL STACK PRODUCT ENGINEER
             </span>
          </motion.div>

          <div className="relative inline-block group w-full">
            <motion.h1
              className="text-[14vw] md:text-[10vw] lg:text-[8rem] xl:text-[9.5rem] font-sans font-black tracking-tighter leading-none select-none relative z-10 w-full overflow-hidden"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.3, ease: [0.76, 0, 0.24, 1] }}
            >
              <span className="bg-clip-text text-transparent bg-[size:200%_auto] animate-shimmer bg-gradient-to-r from-surface-900 via-surface-500 to-surface-900 drop-shadow-sm">
                KSCOLD
              </span>
            </motion.h1>
            {/* Ambient Shadow behind text */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-full bg-surface-200 blur-[60px] z-0 opacity-0 group-hover:opacity-30 transition-opacity duration-1000 pointer-events-none" />
          </div>

          <motion.div
             className="h-px w-24 bg-gradient-to-r from-transparent via-surface-300 to-transparent mx-auto opacity-70"
             initial={{ width: 0 }}
             animate={{ width: 96 }}
             transition={{ duration: 1.5, delay: 0.5, ease: [0.76, 0, 0.24, 1] }}
          />

          <motion.p
            className="mt-6 text-lg sm:text-2xl text-surface-500 font-light max-w-2xl mx-auto leading-relaxed text-balance tracking-tight"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.6, ease: [0.76, 0, 0.24, 1] }}
          >
            <span className="text-surface-900 font-semibold">러닝커브</span>를 즐기는 <span className="text-surface-900 font-semibold relative after:absolute after:bottom-1 after:left-0 after:w-full after:h-2 after:bg-blue-100 after:-z-10 px-1">개발자</span>,<br />
            사용자 경험을 완성하는 <span className="text-surface-900 font-semibold relative after:absolute after:bottom-1 after:left-0 after:w-full after:h-2 after:bg-blue-100 after:-z-10 px-1">프로덕트 엔지니어</span>입니다.
          </motion.p>

          <motion.div
             className="w-[1px] h-24 bg-gradient-to-b from-surface-200/0 via-surface-300 to-surface-200/0 mx-auto mt-12"
             initial={{ height: 0 }}
             animate={{ height: 128 }}
             transition={{ duration: 1.5, delay: 1, ease: [0.76, 0, 0.24, 1] }}
          />

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-12 pb-20 w-full max-w-lg mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.7, ease: [0.76, 0, 0.24, 1] }}
          >
            <Link
              href="/blog"
              className="group relative flex items-center justify-center w-full sm:w-auto px-10 py-4 bg-surface-900 text-white font-bold rounded-2xl overflow-hidden transition-all duration-300 shadow-[0_8px_20px_-8px_rgba(15,23,42,0.6)] hover:shadow-[0_12px_30px_-10px_rgba(15,23,42,0.8)] hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-surface-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute inset-x-0 top-0 h-px bg-white/20" />
              <span className="relative z-10 flex items-center justify-center gap-2">
                블로그 구경하기
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </Link>
            <Link
              href="/portfolio"
              className="group flex items-center justify-center w-full sm:w-auto px-10 py-4 text-surface-600 bg-white border border-surface-200 hover:border-surface-900 hover:text-surface-900 transition-all duration-300 rounded-2xl hover:shadow-sm"
            >
              <span className="font-bold tracking-wide">포트폴리오 보기</span>
            </Link>
          </motion.div>

          {/* Social Links - Interactive */}
          <motion.div
            className="flex items-center justify-center gap-10 pt-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            {['Github', 'LinkedIn', 'Email'].map((social) => (
               <a key={social} href="#" className="text-xs text-surface-500 hover:text-surface-900 transition-all hover:scale-110 uppercase tracking-[0.3em] font-bold relative group">
                  {social}
                  <span className="absolute -bottom-2 left-0 w-full h-[1px] bg-surface-900 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
               </a>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Featured Posts Section - Light Mode */}
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
            <Link href="/blog" className="hidden sm:block text-surface-500 hover:text-surface-900 transition-colors uppercase text-sm tracking-widest font-bold">
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
              <p className="text-lg text-surface-500 font-mono">
                작성된 포스트가 없습니다.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* About Section - Minimalist */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-white border-t border-surface-200">
         <div className="max-w-5xl mx-auto">
            <div className="bg-surface-50 border border-surface-200 rounded-[2rem] p-12 text-center relative overflow-hidden group">
               <div className="absolute inset-0 bg-surface-100 opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
               <div className="relative z-10">
                  <h2 className="text-3xl font-sans font-bold text-surface-900 mb-8 tracking-tight">Design Philosophy</h2>
                  <p className="text-xl text-surface-600 leading-relaxed max-w-3xl mx-auto">
                     "단순함은 궁극의 정교함이다." <br/>
                     <span className="text-surface-900 font-semibold text-base mt-2 block">Enjoying the Learning Curve.</span>
                  </p>
                  <div className="mt-12">
                     <Link href="/about" className="px-8 py-3 bg-surface-900 hover:bg-surface-800 text-white rounded-xl transition-colors font-bold shadow-lg">
                        더 알아보기
                     </Link>
                  </div>
               </div>
            </div>
         </div>
      </section>
    </main>
  );
}
