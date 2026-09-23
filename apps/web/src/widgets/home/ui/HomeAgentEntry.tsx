import Link from 'next/link';
import { AGENT_ENTRY_TOPICS } from '@/features/chat';
import styles from './heroEditorial.module.css';

export function HomeAgentEntry() {
  return (
    <div className={styles.agentEntry}>
      <Link href="/?chat=open" className={styles.agentLink}>
        <span className={styles.agentIcon} aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
            <path d="M8 1v14M1 8h14M3 3l10 10M3 13 13 3" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        </span>
        <span><strong>KSCOLD Agent에게 물어보세요</strong><small>블로그·피드·노트·소개에서 기록과 출처를 찾아요.</small></span>
        <span className={styles.agentArrow} aria-hidden="true">↗</span>
      </Link>
      <div className={styles.agentTopics} aria-label="Agent 질문 시작하기">
        {Object.entries(AGENT_ENTRY_TOPICS).map(([topic, entry]) => (
          <Link key={topic} href={`/?chat=open&agentTopic=${topic}`}>{entry.label} <span aria-hidden="true">→</span></Link>
        ))}
      </div>
    </div>
  );
}
