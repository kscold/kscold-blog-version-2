import Link from 'next/link';
import { HeroClock } from './HeroClock';
import { HeroLogo } from './HeroLogo';
import styles from './heroEditorial.module.css';

function HeroArtwork() {
  return (
    <div className={styles.artwork} data-testid="hero-artwork" aria-hidden="true">
      <div className={styles.aura} />
      <svg className={styles.orbits} viewBox="0 0 600 500" fill="none">
        <ellipse cx="300" cy="270" rx="265" ry="92" transform="rotate(-24 300 270)" />
        <ellipse cx="300" cy="270" rx="265" ry="92" transform="rotate(-24 300 270) translate(0 14)" />
      </svg>
      <HeroLogo />
      <span className={styles.artCaption}>Ideas take shape.</span>
    </div>
  );
}

function HeroIntroduction() {
  return (
    <div className={styles.copy}>
      <p className={styles.eyebrow}><span /> 김승찬의 기술 블로그</p>
      <h1 className={styles.title}>
        지식을 기록하고,<br />
        <span>연결을 공유합니다.</span>
      </h1>
      <p data-cy="hero-tagline" className={styles.description}>
        러닝커브를 즐기는 개발자{' '}
        <Link href="/info">김승찬</Link>입니다.<br />
        AI Agent부터 서버·웹까지,<br className={styles.mobileBreak} /> 문제를 서비스로 풀어냅니다.
      </p>
      <div className={styles.actions}>
        <Link href="/blog" data-cy="hero-primary-cta" className={styles.primary}>
          블로그 구경하기 <span aria-hidden="true">↗</span>
        </Link>
        <Link href="/feed" data-cy="hero-secondary-cta" className={styles.secondary}>
          피드 보기 <span aria-hidden="true">→</span>
        </Link>
      </div>
      <Link href="/?chat=open" className={styles.agentLink}>
        <svg className={styles.agentGlyph} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M8 1v14M1 8h14M3 3l10 10M3 13 13 3" stroke="currentColor" strokeWidth="1.2" />
        </svg>
        궁금한 건 Agent에게 <span aria-hidden="true">↗</span>
      </Link>
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
        <span className={styles.continue} aria-hidden="true">더 아래에, 더 많은 이야기 <span>↓</span></span>
      </div>
    </section>
  );
}
