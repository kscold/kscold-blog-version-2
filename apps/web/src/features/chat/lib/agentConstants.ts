import type {
  VaultAgentContentScope,
  VaultAgentSource,
  VaultAgentStage,
} from '@/features/chat/api/vaultAgentApi';

export interface AgentMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  stages?: VaultAgentStage[];
  sources?: VaultAgentSource[];
  followUps?: string[];
  isStreaming?: boolean;
  responseStatus?: 'complete' | 'interrupted' | 'error';
}

export const AGENT_QUESTION_MAX_LENGTH = 1200;

export function createInitialAgentMessages(
  contentScope?: VaultAgentContentScope
): AgentMessage[] {
  return [
    {
      id: 'initial-agent-greeting',
      role: 'assistant',
      content: `안녕하세요. KSCOLD Agent예요. 블로그 글, 피드, Vault 기록, 소개 페이지를 함께 살펴보고 질문에 맞는 내용을 찾아드려요. ${contentScope?.description || '현재는 공개된 기록을 바탕으로 답합니다.'}`,
      stages: [
        { name: '찾기', detail: '블로그·피드·Vault·소개 페이지에서 질문과 가까운 기록을 찾습니다.' },
        { name: '연결', detail: 'Vault 링크와 백링크를 따라 필요한 맥락을 함께 확인합니다.' },
        { name: '보강', detail: '최신 정보가 필요한 경우에만 웹 자료를 추가로 살핍니다.' },
        { name: '출처', detail: '답변과 함께 바로 열어볼 수 있는 기록을 남깁니다.' },
      ],
    },
  ];
}

export const INITIAL_AGENT_MESSAGES = createInitialAgentMessages();

export const starterPrompts = [
  '최근 블로그에서 AI Agent 관련 내용 요약해줘',
  '최근 피드에서 눈여겨볼 만한 내용 알려줘',
  '승찬님은 어떤 개발자야?',
  'JavaScript async await 노트 설명해줘',
  'Vault에서 먼저 보면 좋은 노트 알려줘',
];

export const sourceHref = (source: VaultAgentSource) => {
  const fallback = `/vault/${encodeURIComponent(source.slug)}`;
  const path = source.path?.trim() || fallback;
  // 출처를 조작해 외부 프로토콜을 실행하거나 내부 대화 파라미터를 외부로 보내지 않는다.
  const hasUnsafeCharacters = /[\u0000-\u001f\u007f\\]/.test(path);
  if (!hasUnsafeCharacters && path.startsWith('https://')) {
    try {
      const external = new URL(path);
      if (external.protocol === 'https:' && !external.username && !external.password) {
        return external.href;
      }
    } catch {
      // 잘못된 주소는 내부 노트 주소로 되돌린다.
    }
  }
  const safePath = !hasUnsafeCharacters && path.startsWith('/') && !path.startsWith('//')
    ? path
    : fallback;
  const internal = new URL(safePath, 'https://kscold.com');
  internal.searchParams.set('chat', 'open');
  return `${internal.pathname}${internal.search}${internal.hash}`;
};

/** Agent가 남긴 근거 번호를 현재 대화를 유지하는 내부 링크로 바꿈. */
export function linkAgentSourceCitations(
  content: string,
  sources: VaultAgentSource[] | undefined
) {
  if (!sources?.length) {
    return content;
  }

  return content.replace(/【S(\d+)】/g, (citation, sourceIndex: string) => {
    const source = sources[Number(sourceIndex) - 1];
    if (!source) {
      return citation;
    }
    return `[출처 ${sourceIndex}](${sourceHref(source)})`;
  });
}
