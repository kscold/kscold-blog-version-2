'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useFeaturedPosts } from '@/hooks/usePosts';
import { PostCard } from '@/components/blog/PostCard';

export default function HomePage() {
  const { data: featuredPosts, isLoading } = useFeaturedPosts(6);

  return (
    <main className="min-h-screen text-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background elements moved to layout.tsx */ }

        <motion.div
          className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center min-h-[85vh] gap-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8, delay: 0.2 }}
             className="inline-block"
          >
             <span className="px-5 py-2 rounded-full border border-accent-light/30 bg-accent-light/5 text-accent-light text-sm font-bold tracking-[0.2em] backdrop-blur-md shadow-[0_0_20px_rgba(6,182,212,0.2)] animate-pulse-slow">
                FULL STACK PRODUCT ENGINEER
             </span>
          </motion.div>

          <div className="relative inline-block group">
            <motion.h1
              className="text-[13vw] lg:text-[11rem] font-sans font-black tracking-tighter leading-none select-none relative z-10"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <span className="bg-clip-text text-transparent bg-[size:200%_auto] animate-shimmer bg-gradient-to-r from-white via-accent-light to-accent-blue">
                KSCOLD
              </span>
            </motion.h1>
            {/* Ambient Glow behind text */}
            <div className="absolute inset-0 bg-accent-blue/20 blur-[100px] z-0 opacity-50 group-hover:opacity-80 transition-opacity duration-1000" />
          </div>

          <motion.div
             className="h-1 w-24 bg-gradient-to-r from-transparent via-accent-light to-transparent mx-auto rounded-full opacity-50"
             initial={{ width: 0 }}
             animate={{ width: 96 }}
             transition={{ duration: 1, delay: 0.5 }}
          />

          <motion.p
            className="text-xl sm:text-2xl text-surface-300 font-light max-w-2xl mx-auto leading-relaxed text-balance"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            <span className="text-white font-medium drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">러닝커브</span>를 즐기는<span className="text-accent-blue font-medium drop-shadow-[0_0_10px_rgba(59,130,246,0.3)]">개발자</span>,<br />
            사용자 경험을 완성하는 <span className="text-accent-light font-medium">프로덕트 엔지니어</span>입니다.
          </motion.p>

          <motion.div
             className="w-[1px] h-32 bg-gradient-to-b from-accent-light/0 via-accent-light/50 to-accent-light/0 mx-auto mt-12"
             initial={{ height: 0 }}
             animate={{ height: 128 }}
             transition={{ duration: 1, delay: 1 }}
          />

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8 pb-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            <Link
              href="/blog"
              className="group relative px-8 py-4 bg-white text-background-dark font-bold rounded-full overflow-hidden transition-transform hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-accent-light to-accent-blue opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative z-10 group-hover:text-white transition-colors">블로그 구경하기</span>
            </Link>
            <Link
              href="/portfolio"
              className="px-8 py-4 text-white border border-white/20 hover:border-accent-light hover:text-accent-light hover:bg-white/5 transition-all rounded-full"
            >
              <span className="font-bold">포트폴리오 보기</span>
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
               <a key={social} href="#" className="text-xs text-surface-400 hover:text-accent-light transition-all hover:scale-110 uppercase tracking-[0.3em] font-bold relative group">
                  {social}
                  <span className="absolute -bottom-2 left-0 w-full h-[1px] bg-accent-light scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
               </a>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Featured Posts Section - Cold Blue Tone */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-black/50 relative border-t border-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="flex items-end justify-between mb-20 border-b border-white/10 pb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div>
               <h2 className="text-4xl sm:text-5xl font-sans font-bold text-white mb-2 tracking-tight">
                 Featured <span className="text-accent-light">Posts</span>
               </h2>
               <p className="text-surface-400">엄선된 개발 이야기</p>
            </div>
            <Link href="/blog" className="hidden sm:block text-surface-400 hover:text-accent-light transition-colors uppercase text-sm tracking-widest font-bold">
               전체 보기
            </Link>
          </motion.div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-96 bg-surface-900/50 rounded-3xl animate-pulse"
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
            <div className="text-center py-20 border border-white/10 border-dashed rounded-3xl">
              <p className="text-lg text-surface-500 font-mono">
                작성된 포스트가 없습니다.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* About Section - Glass Box */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-background-dark border-t border-white/5">
         <div className="max-w-5xl mx-auto">
            <div className="glass-card p-12 text-center relative overflow-hidden group">
               <div className="absolute inset-0 bg-accent-blue/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
               <div className="relative z-10">
                  <h2 className="text-3xl font-sans font-bold text-white mb-8 tracking-tight">Design Philosophy</h2>
                  <p className="text-xl text-surface-300 leading-relaxed max-w-3xl mx-auto">
                     "단순함은 궁극의 정교함이다." <br/>
                     <span className="text-accent-light text-base mt-2 block">Enjoying the Learning Curve.</span>
                  </p>
                  <div className="mt-12">
                     <Link href="/about" className="px-8 py-3 bg-surface-800 hover:bg-accent-blue text-white rounded-xl transition-colors font-bold shadow-lg">
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
