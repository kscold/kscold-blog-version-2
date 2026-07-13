import type { VaultAgentSource, VaultAgentStage } from '@/features/chat/api/vaultAgentApi';

export interface AgentMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  stages?: VaultAgentStage[];
  sources?: VaultAgentSource[];
  followUps?: string[];
}

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
