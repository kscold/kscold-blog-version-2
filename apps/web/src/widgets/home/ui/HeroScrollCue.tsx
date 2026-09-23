import styles from './heroScroll.module.css';

/** 움직임이 없어도 목적지와 의미를 알 수 있는 일반 페이지 내 링크다. */
export function HeroScrollCue({ className }: { className?: string }) {
  return (
    <a href="#home-content" className={`${styles.cue} ${className ?? ''}`} data-testid="hero-scroll-cue">
      <span>아래로 이어지는 기록</span>
      <span className={styles.arrow} aria-hidden="true">
        <svg width="16" height="20" viewBox="0 0 16 20" fill="none">
          <path d="M8 3v13m-5-5 5 5 5-5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </a>
  );
}
