import styles from './homeExperience.module.css';
import { HomeMarquee } from './HomeMarquee';

export function HomeManifesto() {
  return (
    <section aria-labelledby="home-manifesto">
      <HomeMarquee />
      <div className={styles.manifesto}>
        <p className={`${styles.eyebrow} mb-8 text-surface-500`}>(02) A work in progress</p>
        <h2 id="home-manifesto">배운 것은 기록으로.<br />기록은 <mark>다음 문제의 실마리</mark>로.<br />만드는 과정까지 공유합니다.</h2>
        <div className="mt-12 grid gap-8 border-t border-surface-200 pt-8 md:grid-cols-3">
          {[
            ['Build', 'AI Agent부터 서버와 웹까지. 아이디어가 실제로 동작하는 서비스를 만듭니다.'],
            ['Learn', '새로운 기술을 배우고, 직접 부딪힌 문제와 선택의 이유를 기록합니다.'],
            ['Connect', '흩어진 생각을 연결하고, 함께 더 나은 답을 찾아갑니다.'],
          ].map(([title, text]) => <div key={title}><h3 className="mb-3 text-xl font-bold">{title}</h3><p className="text-sm leading-7 text-surface-500">{text}</p></div>)}
        </div>
      </div>
    </section>
  );
}
