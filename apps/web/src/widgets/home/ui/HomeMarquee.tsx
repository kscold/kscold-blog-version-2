'use client';

import { useState } from 'react';
import styles from './homeExperience.module.css';

export function HomeMarquee() {
  const [isPaused, setIsPaused] = useState(false);
  return <div className={styles.marquee}>
    <div className={styles.marqueeTrack} aria-hidden="true" style={{ animationPlayState: isPaused ? 'paused' : undefined }}>
      {[0, 1].map(copy => <span key={copy}>기록하고, 연결하고. <em>Stay curious.</em> ◎ Build. Learn. Share. ◎ </span>)}
    </div>
    <button type="button" aria-pressed={isPaused} onClick={() => setIsPaused(!isPaused)}
      className="ml-8 mt-4 min-h-11 text-xs font-medium text-surface-500 motion-reduce:hidden">
      {isPaused ? '흐르는 문구 재생' : '흐르는 문구 일시정지'}
    </button>
  </div>;
}
