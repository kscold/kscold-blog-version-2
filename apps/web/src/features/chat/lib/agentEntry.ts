export const AGENT_ENTRY_TOPICS = {
  engineering: {
    label: 'AI Agent 글 찾기',
    question: '블로그·피드·Vault에서 AI Agent와 LangGraph 관련 기록을 찾아 핵심과 읽을 순서를 출처와 함께 알려줘.',
  },
  profile: {
    label: '경력·프로젝트 알아보기',
    question: '김승찬의 소개와 공개 프로젝트를 바탕으로 AI Agent, 백엔드, 풀스택 개발 경험을 출처와 함께 정리해줘.',
  },
} as const;

export function getAgentEntryQuestion(topic: string | null): string | undefined {
  if (!topic || !Object.prototype.hasOwnProperty.call(AGENT_ENTRY_TOPICS, topic)) return undefined;
  return AGENT_ENTRY_TOPICS[topic as keyof typeof AGENT_ENTRY_TOPICS].question;
}
