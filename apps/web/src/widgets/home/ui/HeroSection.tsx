import Link from 'next/link';
import { HeroClock } from './HeroClock';
import { HeroLogo } from './HeroLogo';
import { HomeAgentEntry } from './HomeAgentEntry';
import { HeroScrollArtwork } from './HeroScrollArtwork';
import { HeroScrollCue } from './HeroScrollCue';
import styles from './heroEditorial.module.css';

function HeroArtwork() {
  return (
    <HeroScrollArtwork className={styles.artwork}>
      <div className={styles.aura} />
      <svg className={styles.orbits} viewBox="0 0 600 500" fill="none">
        <ellipse cx="300" cy="270" rx="265" ry="92" transform="rotate(-24 300 270)" />
        <ellipse cx="300" cy="270" rx="265" ry="92" transform="rotate(-24 300 270) translate(0 14)" />
      </svg>
      <HeroLogo />
    </HeroScrollArtwork>
  );
}

function HeroIntroduction() {
  return (
    <div className={styles.copy}>
      <p className={styles.eyebrow}><span /> <span><strong>김승찬</strong>의 기술 블로그</span></p>
      <h1 className={styles.title}>
        지식을 <strong className={styles.recordEmphasis}>기록</strong>하고,<br />
        <strong className={styles.connectEmphasis}>연결</strong>을 공유합니다.
      </h1>
      <p data-cy="hero-tagline" className={styles.description}>
        <strong>러닝커브</strong>를 즐기는 개발자{' '}
        <Link href="/info">김승찬</Link>입니다.<br />
        <strong className={styles.agentEmphasis}>AI Agent</strong>부터 <strong>서버·웹</strong>까지,<br className={styles.mobileBreak} /> 문제를 서비스로 풀어냅니다.
      </p>
      <div className={styles.actions}>
        <Link href="/blog" data-cy="hero-primary-cta" className={styles.primary}>
          블로그 구경하기 <span aria-hidden="true">↗</span>
        </Link>
        <Link href="/feed" data-cy="hero-secondary-cta" className={styles.secondary}>
          피드 보기 <span aria-hidden="true">→</span>
        </Link>
      </div>
      <HomeAgentEntry />
    </div>
  );
}

export function HeroSection() {
  return (
    <section className={styles.hero} data-testid="home-hero">
      <div className={styles.meta}>
        <span>Notes on building<span className={styles.metaAccent}> & learning</span></span>
        <HeroClock />
      </div>
      <div className={styles.composition}>
        <HeroIntroduction />
        <HeroArtwork />
      </div>
      <div className={styles.signature}>
        <span className={styles.wordmark} aria-label="KSCOLD">KSCOLD<span /></span>
        <span className={styles.disciplines}>AI Agent <i /> Backend <i /> Web</span>
        <HeroScrollCue />
      </div>
    </section>
  );
}
