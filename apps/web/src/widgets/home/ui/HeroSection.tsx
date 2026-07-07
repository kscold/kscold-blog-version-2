'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { usePerformanceMode } from '@/shared/model/usePerformanceMode';

export function HeroSection() {
  const { supportsHover, prefersReducedMotion } = usePerformanceMode();
  const animate = !prefersReducedMotion;

  return (
    <section className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden">
      {/* 에디토리얼 무드의 미세 도트 그리드 — 순수 CSS라 성능 부담 없음 */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none opacity-[0.5]"
        style={{
          backgroundImage: 'radial-gradient(circle, rgb(148 163 184 / 0.22) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          maskImage: 'radial-gradient(ellipse 70% 60% at 50% 42%, black 30%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 42%, black 30%, transparent 75%)',
        }}
      />
      <motion.div
        className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center gap-8 sm:gap-12 text-center my-12 sm:my-16"
        initial={animate ? { opacity: 0 } : false}
        animate={animate ? { opacity: 1 } : undefined}
        transition={animate ? { duration: 1 } : undefined}
      >
        <motion.div
          initial={animate ? { opacity: 0, y: 20 } : false}
          animate={animate ? { opacity: 1, y: 0 } : undefined}
          transition={animate ? { duration: 1.2, delay: 0.2, ease: [0.76, 0, 0.24, 1] } : undefined}
          className="inline-block"
        >
          <span className="px-5 py-2.5 rounded-full border border-surface-200/60 bg-white/60 backdrop-blur-md shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] text-surface-900 text-xs font-bold tracking-[0.2em] flex items-center gap-2 cursor-default">
            <span className="w-1.5 h-1.5 rounded-full bg-surface-900 animate-pulse shadow-[0_0_8px_rgba(15,23,42,0.4)]" />
            FULL STACK PRODUCT ENGINEER
          </span>
        </motion.div>

        <div className="relative group w-full flex justify-center">
          <motion.h1
            className="text-[14vw] md:text-[10vw] lg:text-[8rem] xl:text-[9.5rem] font-sans font-black tracking-tighter leading-none select-none relative z-10 text-surface-900"
            initial={animate ? { opacity: 0, y: 40 } : false}
            animate={animate ? { opacity: 1, y: 0 } : undefined}
            transition={animate ? { duration: 1.2, delay: 0.3, ease: [0.76, 0, 0.24, 1] } : undefined}
          >
            {/* 검색·접근성용 제목 (시각적으로는 KSCOLD 로고 노출) */}
            <span className="sr-only">김승찬 블로그 — 프로덕트 엔지니어 김승찬(kscold)</span>
            <span
              aria-hidden="true"
              className="bg-clip-text text-transparent bg-gradient-to-r from-surface-900 via-surface-500 to-surface-900 inline-block px-[0.05em] bg-[size:200%_auto] animate-shimmer"
            >
              KSCOLD
            </span>
          </motion.h1>
          {supportsHover && (
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-full bg-surface-200 blur-[60px] z-0 opacity-0 group-hover:opacity-30 transition-opacity duration-1000 pointer-events-none" />
          )}
        </div>

        <motion.div
          className="h-px w-24 bg-gradient-to-r from-transparent via-surface-300 to-transparent mx-auto opacity-70"
          initial={animate ? { width: 0 } : false}
          animate={animate ? { width: 96 } : undefined}
          transition={animate ? { duration: 1.5, delay: 0.5, ease: [0.76, 0, 0.24, 1] } : undefined}
        />

        <motion.p
          data-cy="hero-tagline"
          className="mt-6 text-lg sm:text-2xl text-surface-500 font-light max-w-2xl mx-auto leading-relaxed text-balance tracking-tight"
          initial={animate ? { opacity: 0 } : false}
          animate={animate ? { opacity: 1 } : undefined}
          transition={animate ? { duration: 1.2, delay: 0.6, ease: [0.76, 0, 0.24, 1] } : undefined}
        >
          <span className="text-surface-900 font-semibold">러닝커브</span>를 즐기는{' '}
          <span className="text-surface-900 font-semibold relative after:absolute after:bottom-1 after:left-0 after:w-full after:h-2 after:bg-blue-100 after:-z-10 px-1">
            개발자
          </span>
          ,<br />
          문제를 서비스로 풀어내는
          <br />
          <span className="text-surface-900 font-semibold relative after:absolute after:bottom-1 after:left-0 after:w-full after:h-2 after:bg-blue-100 after:-z-10 px-1">
            프로덕트 엔지니어 김승찬
          </span>
          입니다.
        </motion.p>

        <motion.div
          className="w-[1px] h-[5rem] sm:h-[8rem] bg-gradient-to-b from-surface-200/0 via-surface-300 to-surface-200/0 mx-auto mt-6 sm:mt-12 origin-top"
          initial={animate ? { scaleY: 0 } : false}
          animate={animate ? { scaleY: 1 } : undefined}
          transition={animate ? { duration: 1.5, delay: 1, ease: [0.76, 0, 0.24, 1] } : undefined}
        />

        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 pt-6 sm:pt-12 pb-12 sm:pb-20 w-full max-w-3xl mx-auto"
          initial={animate ? { opacity: 0, y: 20 } : false}
          animate={animate ? { opacity: 1, y: 0 } : undefined}
          transition={animate ? { duration: 1.2, delay: 0.7, ease: [0.76, 0, 0.24, 1] } : undefined}
        >
          <Link
            href="/blog"
            data-cy="hero-primary-cta"
            className="group relative flex items-center justify-center w-full sm:w-auto px-10 py-4 bg-surface-900 text-white font-bold rounded-2xl overflow-hidden transition-all duration-300 shadow-[0_8px_20px_-8px_rgba(15,23,42,0.6)] active:scale-95"
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
            href="/feed"
            data-cy="hero-secondary-cta"
            className="group flex items-center justify-center w-full sm:w-auto px-10 py-4 text-surface-600 bg-white border border-surface-200 hover:border-surface-900 hover:text-surface-900 transition-all duration-300 rounded-2xl hover:shadow-sm active:scale-95"
          >
            <span className="font-bold tracking-wide">피드 보기</span>
          </Link>
          <Link
            href="/?chat=open"
            className="group flex items-center justify-center w-full sm:w-auto px-10 py-4 text-surface-600 bg-white border border-surface-200 hover:border-surface-900 hover:text-surface-900 transition-all duration-300 rounded-2xl hover:shadow-sm active:scale-95"
          >
            <span className="font-bold tracking-wide">Agent에게 묻기</span>
          </Link>
        </motion.div>

        {/* 외부 링크 */}
        <motion.div
          className="flex items-center justify-center gap-10 pt-12"
          initial={animate ? { opacity: 0 } : false}
          animate={animate ? { opacity: 0.8 } : undefined}
          whileHover={supportsHover ? { opacity: 1 } : undefined}
          transition={animate ? { duration: 0.5, delay: 0.8 } : undefined}
        >
          {[
            { label: 'Github', href: 'https://github.com/kscold' },
            { label: 'Instagram', href: 'https://www.instagram.com/ks_cold' },
            { label: 'Email', href: 'mailto:contact@coldcraft.dev' },
          ].map(social => (
            <a
              key={social.label}
              href={social.href}
              target={social.href.startsWith('http') ? '_blank' : undefined}
              rel={social.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="text-xs text-surface-500 hover:text-surface-900 transition-all hover:scale-110 uppercase tracking-[0.3em] font-bold relative group"
            >
              {social.label}
              <span className="absolute -bottom-2 left-0 w-full h-[1px] bg-surface-900 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
            </a>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
