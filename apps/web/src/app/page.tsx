'use client';

import Link from 'next/link';
import { HeroSection } from '@/widgets/home/ui/HeroSection';
import { FeaturedPostsSection } from '@/widgets/home/ui/FeaturedPostsSection';

export default function HomePage() {
  return (
    <main className="min-h-screen text-surface-900">
      <HeroSection />

      <FeaturedPostsSection />

      {/* 소개 섹션 */}
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
