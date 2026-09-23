import Link from 'next/link';
import { HeroClock } from './HeroClock';
import { HeroLogo } from './HeroLogo';
import { HomeArrival } from './HomeArrival';
import styles from './homeExperience.module.css';

// 흐르는 곡선. 가운데 로고 쪽으로 모였다가 퍼지게 그린다.
const FLOW_LINES = Array.from({ length: 8 }, (_, index) => {
  const offset = index * 46;
  return `M -80 ${120 + offset} C 320 ${40 + offset * 0.6}, 760 ${620 - offset * 0.9}, 1280 ${260 + offset * 0.7}`;
});

/** 배경: 기존 도트 그리드 위에 흐르는 곡선과 옅은 스카이·시안 빛을 깐다. 전부 CSS/SVG 라 가볍다. */
function HeroBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage: 'radial-gradient(circle, rgb(148 163 184 / 0.22) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          maskImage: 'radial-gradient(ellipse 75% 65% at 55% 45%, black 30%, transparent 78%)',
          WebkitMaskImage: 'radial-gradient(ellipse 75% 65% at 55% 45%, black 30%, transparent 78%)',
        }}
      />
      <div className="hero-glow absolute left-[57%] top-[45%] h-[44rem] w-[44rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgb(186_230_253/0.55),transparent_62%)]" />
      <div className="hero-glow-soft absolute left-[70%] top-[62%] h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgb(165_243_252/0.4),transparent_65%)]" />
      <svg
        className="hero-flow absolute inset-0 h-full w-full"
        viewBox="0 0 1200 800"
        preserveAspectRatio="none"
      >
        {FLOW_LINES.map((d, index) => (
          <path
            key={index}
            d={d}
            fill="none"
            stroke="#94a3b8"
            strokeOpacity={0.14 + (index % 3) * 0.06}
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-surface-50" />
    </div>
  );
}

export function HeroSection() {
  return (
    <div className={styles.heroScene}>
    <section className="relative isolate flex min-h-[calc(100svh-4rem)] flex-col overflow-hidden px-5 pb-24 pt-6 sm:px-8 sm:pb-10 lg:px-12 lg:pb-10 lg:pt-10">
      <HeroBackdrop />
      <HomeArrival />

      {/* 모서리 라벨 */}
      <div className="relative z-10 flex items-center justify-between gap-4 text-[10px] font-bold uppercase tracking-[0.24em] text-surface-400">
        <span>(01) Engineering Journal</span>
        <span className="hidden md:inline">AI Agent · Backend · Full-stack</span>
        <HeroClock />
      </div>

      {/* 입체 로고. 모바일은 글 사이에 자리를 차지하고, 데스크톱은 섹션 전체에 깔린다. */}
      <div className="relative -mx-5 h-[88vw] max-h-[440px] sm:-mx-8 lg:absolute lg:inset-0 lg:mx-0 lg:h-auto lg:max-h-none">
        <HeroLogo />
      </div>

      {/* 가운데 줄: 왼쪽 소개, 오른쪽 스크롤 안내 */}
      <div className="relative z-10 flex flex-1 items-center justify-between gap-10">
        <div data-hero-copy className="max-w-md">
          <p className="text-2xl font-bold leading-snug tracking-tight text-surface-900 sm:text-[1.7rem]">
            지식을 기록하고,
            <br />
            연결을 공유합니다.
          </p>
          <p
            data-cy="hero-tagline"
            className="mt-4 max-w-sm text-sm leading-7 text-surface-500 sm:text-[0.95rem]"
          >
            러닝커브를 즐기는 개발자, AI Agent부터 서버·웹까지 문제를 서비스로 풀어내는{' '}
            <Link
              href="/info"
              className="font-semibold text-surface-900 underline decoration-primary-200 decoration-2 underline-offset-4 transition-colors hover:decoration-primary-400"
            >
              김승찬
            </Link>
            입니다.
          </p>
          <div className="mt-7 flex flex-wrap gap-2.5">
            <Link
              href="/blog"
              data-cy="hero-primary-cta"
              className="group inline-flex items-center gap-2 rounded-full bg-surface-900 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_-10px_rgba(15,23,42,0.7)] transition-all hover:bg-surface-800 active:scale-95"
            >
              블로그 구경하기
              <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </Link>
            <Link
              href="/feed"
              data-cy="hero-secondary-cta"
              className="inline-flex items-center rounded-full border border-surface-200 bg-white/70 px-5 py-2.5 text-sm font-semibold text-surface-600 backdrop-blur-sm transition-all hover:border-surface-900 hover:text-surface-900 active:scale-95"
            >
              피드 보기
            </Link>
            <Link
              href="/?chat=open"
              className="inline-flex items-center rounded-full border border-surface-200 bg-white/70 px-5 py-2.5 text-sm font-semibold text-surface-600 backdrop-blur-sm transition-all hover:border-surface-900 hover:text-surface-900 active:scale-95"
            >
              Agent에게 묻기
            </Link>
          </div>
        </div>

        <div className="hidden flex-col items-center gap-4 text-[10px] font-bold uppercase tracking-[0.3em] text-surface-400 lg:flex">
          <span className="[writing-mode:vertical-rl]">Scroll to explore</span>
          <span className="hero-scroll-line h-16 w-px origin-top bg-gradient-to-b from-surface-400 to-transparent" />
        </div>
      </div>

      {/* 하단 워드마크 */}
      <div className="relative z-10 mt-10">
        <h1 className="select-none">
          <span className="mb-4 block text-xs font-bold tracking-[0.2em] text-surface-500">
            김승찬의 기술 블로그
          </span>{' '}
          <span className="block text-[clamp(4.25rem,16.5vw,16rem)] font-black leading-[0.78] tracking-[-0.065em] text-surface-900">
            KSCOLD
            <span aria-hidden="true" className="text-accent">
              .
            </span>
          </span>
        </h1>
      </div>
    </section>
    </div>
  );
}
