import Link from 'next/link';
import styles from './homeExperience.module.css';

const POINTS = Array.from({ length: 38 }, (_, i) => ({ x: (i * 173 + 43) % 1200, y: (i * i * 37 + 29) % 640 }));

/** 실제 노트 관계나 통계를 나타내지 않는, 연결을 표현한 장식이다. */
function Constellation() {
  return <svg viewBox="0 0 1200 640" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    {POINTS.flatMap((point, i) => POINTS.slice(i + 1).filter(other => Math.hypot(point.x - other.x, point.y - other.y) < 185).map(other =>
      <line key={`${i}-${other.x}`} x1={point.x} y1={point.y} x2={other.x} y2={other.y} stroke="currentColor" strokeWidth=".6" opacity=".4" />))}
    {POINTS.map((point, i) => <circle key={i} cx={point.x} cy={point.y} r={i % 4 === 0 ? 3 : 1.5} fill="currentColor" />)}
  </svg>;
}

export function HomeConnections() {
  return (
    <section className={styles.constellation} aria-labelledby="home-connections">
      <Constellation />
      <div className="relative mx-auto max-w-4xl">
        <p className={`${styles.eyebrow} mb-10 text-primary-300`}>(07) Everything is connected</p>
        <h2 id="home-connections">흩어진 생각이<br /><em>하나의 연결로.</em></h2>
        <p className="mx-auto mt-8 max-w-md text-sm leading-7 text-surface-300">글에서 노트로, 노트에서 새로운 질문으로.<br />정답보다, 함께 탐색하는 과정을 좋아합니다.</p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link href="/vault" className="rounded-full bg-primary-200 px-6 py-3 text-sm font-bold text-surface-950 hover:bg-primary-100">지식 그래프 탐색 ↗</Link>
          <Link href="/?chat=open" className="rounded-full border border-surface-500 px-6 py-3 text-sm font-bold hover:border-primary-300">Agent에게 묻기 ↗</Link>
        </div>
        <p className="mt-20 font-mono text-xs tracking-widest text-surface-400">KEEP LEARNING. KEEP BUILDING.</p>
      </div>
      <div className={styles.wordmark} aria-hidden="true">KSCOLD.</div>
    </section>
  );
}
