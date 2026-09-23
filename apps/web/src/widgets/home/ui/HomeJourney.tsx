import Link from 'next/link';
import { fetchPublicApi } from '@/shared/lib/seo';
import type { PostSummary } from '@/shared/model/types/blog';
import { HOME_JOURNEY } from '../lib/homeJourney';
import { ScrollScene } from './ScrollScene';
import styles from './homeExperience.module.css';

export async function HomeJourney() {
  const posts = await fetchPublicApi<PostSummary[]>('/posts/featured?limit=3').catch(() => null);
  return (
    <ScrollScene className={styles.journeyScene}>
      <section className={styles.journeyStage} aria-labelledby="home-journey">
        <div>
          <p className={`${styles.eyebrow} mb-6 text-surface-500`}>(03) Inside this journal</p>
          <h2 id="home-journey" className={styles.journeyHeading}>하나의 호기심,<br /><span className="text-accent-dark">여러 갈래의 탐색.</span></h2>
          <div className={styles.journeySteps}>
            {HOME_JOURNEY.map((step, index) => <div key={step.label} data-journey-step={index} className={styles.journeyStep}>
              <Link href={step.href}><span className="font-mono text-xs text-surface-500">0{index + 1}</span>{step.label}<span aria-hidden="true">↗</span></Link>
              <p>{step.description}</p>
            </div>)}
          </div>
        </div>
        <div className={styles.previewStack}>
          {HOME_JOURNEY.map((step, index) => <article key={step.label} data-preview={index} className={styles.preview}>
            <div className={styles.previewBar}><span>● ○ ○</span><span>{step.path}</span><span>0{index + 1}</span></div>
            <div className={styles.previewBody}>
              <span className={`${styles.eyebrow} text-primary-700`}>{step.label} / 미리보기</span>
              <h3 className="mt-6 line-clamp-3">{index === 0 ? (posts?.[0]?.title ?? step.title) : step.title}</h3>
              <p className="line-clamp-4">{index === 0 ? (posts?.[0]?.excerpt ?? step.description) : step.description}</p>
              <span className={styles.previewTag}>{step.chip}</span>
            </div>
            <div className="mt-6 flex justify-between border-t border-surface-100 pt-4 text-xs text-surface-500"><span>KSCOLD · 김승찬</span><span>Explore, at your pace ↗</span></div>
          </article>)}
        </div>
      </section>
    </ScrollScene>
  );
}
