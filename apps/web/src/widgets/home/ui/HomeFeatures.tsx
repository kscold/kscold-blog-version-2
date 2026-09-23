import Link from 'next/link';
import { HOME_JOURNEY } from '../lib/homeJourney';
import { ScrollScene } from './ScrollScene';
import styles from './homeExperience.module.css';
import { FeatureIllustration } from './FeatureIllustration';

const FEATURES = [...HOME_JOURNEY, {
  label: 'Admin Night', description: 'AI와 개발, 함께 배우고 이야기하는 모임을 만나보세요.', href: '/admin-night',
}];

export function HomeFeatures() {
  return (
    <ScrollScene className={styles.featureScene}>
      <section className={styles.featureStage} aria-labelledby="home-features">
        <div className={styles.featureHeading}>
          <p className={`${styles.eyebrow} mb-6 text-surface-400`}>(04) Different ways to connect</p>
          <h2 id="home-features">기록 너머의<br /><em>possibilities.</em></h2>
          <p className="mt-5 text-sm text-surface-400">관심 있는 곳부터 둘러보세요. <span aria-hidden="true">↔</span></p>
        </div>
        <div className={styles.featureRail} aria-label="블로그 기능 탐색">
          {FEATURES.map((feature, index) => <Link className={styles.featureCard} href={feature.href} key={feature.label}>
            <div className="mb-6 flex justify-between font-mono text-xs text-surface-400"><span>0{index + 1} / 05</span><span aria-hidden="true">↗</span></div>
            <FeatureIllustration index={index} />
            <h3>{feature.label}</h3><p>{feature.description}</p>
          </Link>)}
        </div>
      </section>
    </ScrollScene>
  );
}
