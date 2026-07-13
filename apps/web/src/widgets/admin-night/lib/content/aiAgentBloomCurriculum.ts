import type { AdminNightProgramAgendaItem, AdminNightProgramTimelineItem } from './types';

export const AI_AGENT_BLOOM_AUDIENCE = [
  'LLM 호출 예제에서 멈추지 않고, Agent 구조까지 한 단계씩 이어가보고 싶은 사람',
  '바이브코딩을 써서 아이디어를 빠르게 코드로 옮기는 흐름을 직접 보고 싶은 사람',
  'State, Node, Edge, Reducer 같은 LangGraph 문법이 실제 실행 흐름에서 어떻게 쓰이는지 알고 싶은 사람',
  'DB, CSV, Web, RAG를 한 흐름 안에서 나누어 쓰는 감각을 잡고 싶은 사람',
  '평가, 관측, fallback처럼 “만들고 난 뒤”에 필요한 기준까지 같이 보고 싶은 사람',
];

export const AI_AGENT_BLOOM_OUTCOMES = [
  'Prompt, Parser, Memory가 어떻게 Agent 흐름으로 이어지는지 큰 그림을 잡습니다.',
  '바이브코딩으로 빠르게 만들고, 바로 실행해보며 고치는 리듬을 경험합니다.',
  '직렬 실행, 조건부 분기, 병렬 fan-out이 왜 필요한지 코드 흐름으로 이해합니다.',
  'DB/CSV처럼 확실한 데이터와 Web/RAG처럼 보강이 필요한 경로를 나누어 보는 기준을 얻습니다.',
  'trace, tool log, judge 평가처럼 결과를 확인하는 최소한의 체크포인트를 가져갑니다.',
];

export const AI_AGENT_BLOOM_AGENDA: AdminNightProgramAgendaItem[] = [
  {
    id: 'foundation',
    eyebrow: 'Part 01',
    title: '핵심 개념 정리: LLM, Agent, Tool, Skill, Workflow',
    description:
      '먼저 말을 맞춥니다. Agent를 단순한 답변 생성기가 아니라, 목표를 보고 도구를 고르는 실행 구조로 놓고 시작합니다.',
    bullets: ['Agent와 Workflow의 차이', 'Tool과 Skill의 역할', '중요 흐름은 Graph로 통제하고 판단은 Agent에 위임'],
  },
  {
    id: 'lcel',
    eyebrow: 'Part 02',
    title: 'LLM 직접 호출에서 LCEL Chain까지',
    description:
      'LangGraph로 바로 들어가지 않습니다. `invoke`, Prompt, Parser, Chain, Memory처럼 자주 쓰는 조각부터 짧게 연결해봅니다.',
    bullets: ['ChatOpenAI invoke', 'Prompt | LLM | Parser', 'JSON Parser와 RunnableParallel', '세션별 Memory'],
  },
  {
    id: 'langgraph-basics',
    eyebrow: 'Part 03',
    title: 'LangGraph 기본 그래프: State, Node, Edge, Reducer',
    description:
      'StateGraph를 하나의 흐름도로 보고, 노드와 edge를 붙여가며 실행 순서를 직접 눈으로 확인합니다.',
    bullets: ['직렬 그래프', '조건부 분기', '병렬 fan-out', 'operator.add와 add_messages reducer'],
  },
  {
    id: 'local-first-mas',
    eyebrow: 'Part 04',
    title: '로컬 우선 MAS: DB Agent + CSV Agent + Web Agent + RAG Agent',
    description:
      '확실한 데이터는 DB/CSV에서 먼저 찾고, 부족한 부분은 Web/RAG로 보강합니다. 여러 Agent를 억지로 많이 붙이기보다 역할을 나누는 감각을 봅니다.',
    bullets: ['entry_node 라우팅', 'DB/CSV 병렬 수집', 'Web fallback', 'RAG Agent 의미 검색 보강', 'Reporter 합류'],
  },
  {
    id: 'xray-test',
    eyebrow: 'Part 05',
    title: '그래프 시각화, X-Ray, 경로 테스트',
    description:
      '답변이 그럴듯한지만 보지 않습니다. 내가 의도한 경로로 실제 실행됐는지 trace와 used_agents로 확인합니다.',
    bullets: ['Mermaid / X-Ray 시각화', '로컬 키 경로 검증', 'RAG fallback 경로 검증', 'Reporter 종료 검증'],
  },
  {
    id: 'ops',
    eyebrow: 'Part 06',
    title: '고도화 포인트: Hybrid Search, Observability, Judge',
    description:
      '마지막에는 더 잘 만들기 위한 갈림길을 정리합니다. 검색, 관측, 평가, 모델 정책을 어디서부터 붙이면 좋을지 이야기합니다.',
    bullets: ['BM25 + Embedding + Rule Search', 'RRF Merge', 'Tool Observability', 'Golden Test', 'LLM-as-Judge', 'Provider Policy'],
  },
];

export const AI_AGENT_BLOOM_TIMELINE: AdminNightProgramTimelineItem[] = [
  {
    time: '0~15분',
    title: '핵심 개념 정리',
    goal: 'Agent, Tool, Skill, Workflow가 어디서 갈라지는지 먼저 맞춥니다.',
  },
  {
    time: '15~35분',
    title: 'LLM 직접 호출과 LCEL',
    goal: '작은 호출 하나에서 Prompt, Parser, Chain으로 자연스럽게 이어갑니다.',
  },
  {
    time: '35~55분',
    title: 'Prompt / Parser / Memory',
    goal: '출력 형식을 잡고, 대화 기억이 필요한 순간을 확인합니다.',
  },
  {
    time: '55~75분',
    title: 'LangGraph 기본 그래프',
    goal: 'State, Node, Edge를 직접 붙이며 그래프가 도는 모습을 봅니다.',
  },
  {
    time: '75~95분',
    title: '조건부/병렬 그래프',
    goal: '분기하고, 병렬로 보내고, 다시 합치는 구조를 만들어봅니다.',
  },
  {
    time: '95~115분',
    title: '로컬 우선 MAS + RAG fallback',
    goal: 'DB/CSV/Web/RAG를 역할별로 나누고, 비어 있는 정보를 보강합니다.',
  },
  {
    time: '115~120분',
    title: '고도화 포인트 정리',
    goal: '관측, 평가, 검색 고도화를 다음 단계로 어떻게 붙일지 정리합니다.',
  },
];
