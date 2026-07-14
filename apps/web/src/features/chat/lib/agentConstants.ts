import type { VaultAgentSource, VaultAgentStage } from '@/features/chat/api/vaultAgentApi';

export interface AgentMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  stages?: VaultAgentStage[];
  sources?: VaultAgentSource[];
  followUps?: string[];
}

export const INITIAL_AGENT_MESSAGES: AgentMessage[] = [
  {
    id: 'initial-agent-greeting',
    role: 'assistant',
    content:
      '안녕하세요. 승찬님이 공개해둔 블로그 글, 피드, Vault 노트, Info 프로필을 함께 찾아 답하는 KSCOLD Agent예요. 비로그인 상태에서는 공개된 콘텐츠만 근거로 사용합니다.',
    stages: [
      { name: '검색', detail: '블로그·피드·Vault·Info에서 질문과 가까운 근거를 찾습니다.' },
      { name: '연결', detail: 'Vault 링크와 백링크로 필요한 경우 주변 맥락을 넓힙니다.' },
      { name: '보강', detail: '최신 정보가 필요한 질문은 웹검색으로 내용을 보강합니다.' },
      { name: '정리', detail: '답변과 함께 바로 열 수 있는 출처를 남깁니다.' },
    ],
  },
];

export const starterPrompts = [
  '최근 블로그에서 AI Agent 관련 내용 요약해줘',
  '최근 피드에서 눈여겨볼 만한 내용 알려줘',
  '승찬님은 어떤 개발자야?',
  'JavaScript async await 노트 설명해줘',
  'Vault에서 먼저 보면 좋은 노트 알려줘',
];

export const sourceHref = (source: VaultAgentSource) => {
  const path = source.path || `/vault/${encodeURIComponent(source.slug)}`;
  return `${path}${path.includes('?') ? '&' : '?'}chat=open`;
};
