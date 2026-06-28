import type {
  AdminNightProgramExperienceLevel,
  AdminNightProgramFoodPreference,
  AdminNightProgramInterestLevel,
  AdminNightProgramPreferredDay,
  AdminNightProgramPreferredFormat,
  AdminNightProgramSessionLength,
  AdminNightProgramSessionStyle,
} from '@/entities/admin-night/model/types';
import type { AdminNightParticipationMode } from './adminNightSlots';

export interface AdminNightStep {
  id: string;
  title: string;
  description: string;
}

export interface AdminNightOption<TValue extends string = string> {
  value: TValue;
  label: string;
  description: string;
}

export interface AdminNightProgramPhase {
  id: string;
  label: string;
  title: string;
  description: string;
  state: 'active' | 'next' | 'later';
}

export interface AdminNightProgramAgendaItem {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  bullets: string[];
}

export interface AdminNightProgramTimelineItem {
  time: string;
  title: string;
  goal: string;
}

export const ADMIN_NIGHT_PARTICIPATION_OPTIONS: AdminNightOption<AdminNightParticipationMode>[] = [
  {
    value: 'ONLINE',
    label: '온라인',
    description: 'Google Meet, Discord, 화면 공유처럼 온라인으로 만날 수 있어요.',
  },
  {
    value: 'OFFLINE',
    label: '오프라인',
    description: '카페나 작업 공간에서 실제로 만나 조용히 각자 할 일을 진행해요.',
  },
  {
    value: 'FLEXIBLE',
    label: '둘 다 가능',
    description: '온라인도 좋고 오프라인 만남도 괜찮아요. 일정에 맞춰 조율할 수 있어요.',
  },
];

export const ADMIN_NIGHT_KEYWORDS = ['Body Doubling', '각할모', '퇴근 후 만남'];

export const ADMIN_NIGHT_HERO_TITLE = '퇴근 후, 각자 할 일을 끝내는 밤';

export const ADMIN_NIGHT_HERO_PARAGRAPHS = [
  "Admin Night는 미뤄둔 개인 잡무를 조용히 끝내는 '각할모(각자 할 일 하는 모임)' 공간입니다. 메일 답장, 블로그 초안, 작은 버그 수정, 문서 정리까지.",
  '오래 이야기하지 않아도 좋습니다. 누군가와 같은 시간대에 몰입하고 있다는 감각만으로도, 미뤄둔 일을 시작하기가 훨씬 쉬워지니까요.',
];

export const ADMIN_NIGHT_PROCESS_TITLE = '신청 PR ➔ Merge / Meet';

export const ADMIN_NIGHT_PROCESS_DESCRIPTION =
  '참여 방식은 개발자들의 워크플로우를 닮았습니다. Admin Night 참여 PR(신청)을 가볍게 보내주세요. 코드가 아닌 시간과 의지를 리뷰하고, 확인 후 승인(Merge)되면 실제 온·오프라인의 만남(Meet)으로 이어지는 흐름입니다.';

export const ADMIN_NIGHT_CALENDAR_DESCRIPTION =
  '거창한 스터디가 아닙니다. 같은 시간대에 각자 할 일을 끝내는 조용한 작업 문화에 가깝습니다.';

export const ADMIN_NIGHT_CULTURE_TITLE = '술 대신, 각자 끝낼 일을 들고 모이는 밤';

export const ADMIN_NIGHT_CULTURE_PARAGRAPHS = [
  '굳이 긴 대화를 나누지 않아도, 무언가를 같이 해야 한다는 부담을 갖지 않아도 괜찮습니다. 타자 소리와 마우스 클릭 소리, 누군가 내 곁에서 집중하고 있다는 사실만으로도 훌륭한 동기부여가 됩니다.',
  '각자의 속도로, 각자의 어드민을 비워내는 밤. 함께하시겠어요?',
  '뭐, 사실 술도 사주시면 좋습니다. 그래도 Admin Night에서는 끝낼 일 하나쯤 챙겨 와 주시면 더 잘 어울립니다.',
];

export const ADMIN_NIGHT_STEPS: AdminNightStep[] = [
  {
    id: 'pick-task',
    title: 'Pick Tonight Task',
    description: '밀린 메일, 문서 정리, 블로그 초안, 작은 버그처럼 오늘 같이 끝내고 싶은 일을 먼저 고릅니다.',
  },
  {
    id: 'request-pr',
    title: 'Send PR',
    description: '실명, 원하는 시간, 진행 방식과 함께 같이 보고 싶은 맥락을 짧게 남깁니다.',
  },
  {
    id: 'merge-meet',
    title: 'Merge / Meet',
    description: '확인 후 승인되면 일정이 캘린더에 올라가고, 같은 시간대의 조용한 만남으로 이어집니다.',
  },
];

export const AI_AGENT_BLOOM_PROGRAM_KEY = 'ai-agent-bloom';

export const AI_AGENT_BLOOM_PHASES: AdminNightProgramPhase[] = [
  {
    id: 'outline',
    label: '01',
    title: '어젠다 공개',
    description: '바이브코딩을 적극 활용하는 오프라인 강의 어젠다와 실습 범위를 먼저 공개합니다.',
    state: 'next',
  },
  {
    id: 'vote',
    label: '02',
    title: '관심 투표',
    description: '듣고 싶은 사람, 강의/네트워킹 선호, 가능한 요일과 시간대를 먼저 모읍니다.',
    state: 'active',
  },
  {
    id: 'schedule',
    label: '03',
    title: '일정 확정',
    description: '충분한 관심이 모이면 실제 일정, 장소, 준비물, 예상 참가비 2만~3만 원 범위를 별도로 공지합니다.',
    state: 'later',
  },
];

export const AI_AGENT_BLOOM_INTEREST_OPTIONS: AdminNightOption<AdminNightProgramInterestLevel>[] = [
  {
    value: 'CURIOUS',
    label: '목차 보고 결정',
    description: '주제는 궁금하지만 커리큘럼을 보고 결정하고 싶어요.',
  },
  {
    value: 'WANT_TO_ATTEND',
    label: '듣고 싶어요',
    description: '오프라인 AI Agent 어젠다 강의를 실제로 들어보고 싶어요.',
  },
  {
    value: 'READY_IF_SCHEDULE_FITS',
    label: '일정 맞으면 참여',
    description: '요일과 시간이 맞으면 바로 참여할 의향이 있어요.',
  },
];

export const AI_AGENT_BLOOM_FORMAT_OPTIONS: AdminNightOption<AdminNightProgramPreferredFormat>[] = [
  {
    value: 'OFFLINE',
    label: '오프라인 고정',
    description: '같은 장소에서 진행하며, 세부 구성은 투표 결과를 보고 정합니다.',
  },
];

export const AI_AGENT_BLOOM_EXPERIENCE_OPTIONS: AdminNightOption<AdminNightProgramExperienceLevel>[] = [
  {
    value: 'NEW_TO_AGENT',
    label: '처음이에요',
    description: 'AI Agent 개념과 구조부터 잡고 싶어요.',
  },
  {
    value: 'BUILT_TOY',
    label: '토이 경험',
    description: 'LangChain, LangGraph, RAG 등을 가볍게 써봤어요.',
  },
  {
    value: 'BUILDING_PRODUCT',
    label: '제품화 중',
    description: '실제 서비스나 업무 자동화에 붙이고 있어요.',
  },
  {
    value: 'OPERATING_SERVICE',
    label: '실전 적용 경험',
    description: '평가, 관측, 장애 대응까지 실제 흐름을 고민하고 있어요.',
  },
];

export const AI_AGENT_BLOOM_DAY_OPTIONS: AdminNightOption<AdminNightProgramPreferredDay>[] = [
  {
    value: 'FRIDAY',
    label: '금요일',
    description: '퇴근 후 조금 늦게 모여도 괜찮아요.',
  },
  {
    value: 'SATURDAY',
    label: '토요일',
    description: '가장 여유 있게 실습과 네트워킹을 이어갈 수 있어요.',
  },
  {
    value: 'SUNDAY',
    label: '일요일',
    description: '주말 마무리로 가볍게 집중하고 싶어요.',
  },
];

export const AI_AGENT_BLOOM_TIME_OPTIONS: AdminNightOption[] = [
  {
    value: 'weekday-night',
    label: '평일 저녁',
    description: '퇴근 후 20:00 이후가 좋아요.',
  },
  {
    value: 'friday-night',
    label: '금요일 밤',
    description: '조금 길게 이어지는 세션도 괜찮아요.',
  },
  {
    value: 'weekend-day',
    label: '주말 낮',
    description: '워크숍처럼 집중해서 듣고 싶어요.',
  },
  {
    value: 'weekend-night',
    label: '주말 저녁',
    description: '가볍게 모여 깊게 이야기하기 좋아요.',
  },
];

export const AI_AGENT_BLOOM_TOPIC_OPTIONS: AdminNightOption[] = [
  {
    value: 'agent-methodology',
    label: 'Agent 설계 방법론',
    description: 'Plan / Act / Reflect, 역할 분리, 상태 설계',
  },
  {
    value: 'langgraph-workflow',
    label: 'LangGraph 워크플로우',
    description: 'StateGraph, edge, checkpoint, multi-agent 구성',
  },
  {
    value: 'tool-rag-memory',
    label: 'Tool · RAG · Memory',
    description: '도구 호출, 검색, 장기 기억을 연결하는 방식',
  },
  {
    value: 'evaluation-observability',
    label: '평가와 관측',
    description: 'LLM-as-Judge, trajectory, LangSmith, 회귀 평가',
  },
  {
    value: 'production-ops',
    label: '실전 적용',
    description: '실서비스 배포, 장애 대응, 속도/보안 트레이드오프',
  },
];

export const AI_AGENT_BLOOM_DETAIL_PATH = '/admin-night/ai-agent-bloom';

export const AI_AGENT_BLOOM_AUDIENCE = [
  'LLM 호출 예제를 넘어 LangGraph 기반 Agent 아키텍처까지 단계적으로 확장해보고 싶은 사람',
  '바이브코딩을 적극 활용해 Agent 구현 흐름을 실제로 따라가보고 싶은 사람',
  'State, Node, Edge, Reducer, START/END 같은 LangGraph 핵심 문법을 코드 흐름으로 이해하고 싶은 사람',
  'DB/CSV/Web/RAG Agent를 조합하고, 정보가 부족할 때 RAG fallback으로 보강하는 구조를 보고 싶은 사람',
  'Hybrid Search, RRF, Tool Observability, Golden Test, LLM-as-Judge 같은 실전 고도화 포인트가 궁금한 사람',
];

export const AI_AGENT_BLOOM_OUTCOMES = [
  'LLM 직접 호출, LCEL Chain, Prompt, Parser, Memory가 Agent 실습으로 이어지는 계단을 설명할 수 있습니다.',
  '바이브코딩을 활용해 Agent 기능을 빠르게 만들고 검증하는 흐름을 경험할 수 있습니다.',
  'LangGraph 직렬 그래프, 조건부 분기, 병렬 fan-out, reducer가 왜 필요한지 코드 기준으로 이해할 수 있습니다.',
  '로컬 우선 MAS 구조에서 DB/CSV Agent와 Web/RAG fallback을 언제 나눠야 하는지 판단할 수 있습니다.',
  'trace, tool log, golden scenario, judge 평가처럼 실습 결과를 검증하는 기준을 잡을 수 있습니다.',
];

export const AI_AGENT_BLOOM_AGENDA: AdminNightProgramAgendaItem[] = [
  {
    id: 'foundation',
    eyebrow: 'Part 01',
    title: '핵심 개념 정리: LLM, Agent, Tool, Skill, Workflow',
    description:
      'Agent를 “답변 생성기”가 아니라 목표를 보고 도구를 활용하는 실행 구조로 잡고, Workflow와 Agent의 경계를 먼저 맞춥니다.',
    bullets: ['Agent와 Workflow의 차이', 'Tool과 Skill의 역할', '중요 흐름은 Graph로 통제하고 판단은 Agent에 위임'],
  },
  {
    id: 'lcel',
    eyebrow: 'Part 02',
    title: 'LLM 직접 호출에서 LCEL Chain까지',
    description:
      'LangGraph로 들어가기 전, `invoke`, Prompt, Parser, Chain, RunnableParallel, Memory의 최소 문법을 빠르게 확인합니다.',
    bullets: ['ChatOpenAI invoke', 'Prompt | LLM | Parser', 'JSON Parser와 RunnableParallel', '세션별 Memory'],
  },
  {
    id: 'langgraph-basics',
    eyebrow: 'Part 03',
    title: 'LangGraph 기본 그래프: State, Node, Edge, Reducer',
    description:
      'StateGraph를 도화지처럼 만들고, 노드를 등록한 뒤 START/END와 edge로 실행 순서를 명시하는 감각을 잡습니다.',
    bullets: ['직렬 그래프', '조건부 분기', '병렬 fan-out', 'operator.add와 add_messages reducer'],
  },
  {
    id: 'local-first-mas',
    eyebrow: 'Part 04',
    title: '로컬 우선 MAS: DB Agent + CSV Agent + Web Agent + RAG Agent',
    description:
      '정확한 로컬 키가 있으면 DB/CSV Agent를 병렬 실행하고, 정보가 부족하면 Web 경로를 거쳐 RAG Agent로 보강하는 구조를 만듭니다.',
    bullets: ['entry_node 라우팅', 'DB/CSV 병렬 수집', 'Web fallback', 'RAG Agent 의미 검색 보강', 'Reporter 합류'],
  },
  {
    id: 'xray-test',
    eyebrow: 'Part 05',
    title: '그래프 시각화, X-Ray, 경로 테스트',
    description:
      '답변이 그럴듯한지보다 설계한 경로가 실제로 실행됐는지 확인합니다. trace와 used_agents로 Agent 흐름을 검증합니다.',
    bullets: ['Mermaid / X-Ray 시각화', '로컬 키 경로 검증', 'RAG fallback 경로 검증', 'Reporter 종료 검증'],
  },
  {
    id: 'ops',
    eyebrow: 'Part 06',
    title: '고도화 포인트: Hybrid Search, Observability, Judge',
    description:
      '실습 그래프를 더 탄탄하게 만들기 위해 검색, 관측, 평가, 모델 정책, 문서 처리 파이프라인을 어떻게 확장할지 정리합니다.',
    bullets: ['BM25 + Embedding + Rule Search', 'RRF Merge', 'Tool Observability', 'Golden Test', 'LLM-as-Judge', 'Provider Policy'],
  },
];

export const AI_AGENT_BLOOM_TIMELINE: AdminNightProgramTimelineItem[] = [
  {
    time: '0~15분',
    title: '핵심 개념 정리',
    goal: 'Agent, Tool, Skill, Workflow, LangGraph 용어를 맞춥니다.',
  },
  {
    time: '15~35분',
    title: 'LLM 직접 호출과 LCEL',
    goal: '바이브코딩을 활용해 invoke, Prompt, Parser, Chain 구조를 빠르게 연결합니다.',
  },
  {
    time: '35~55분',
    title: 'Prompt / Parser / Memory',
    goal: '출력 형식 제어와 세션별 대화 기억의 필요성을 봅니다.',
  },
  {
    time: '55~75분',
    title: 'LangGraph 기본 그래프',
    goal: 'StateGraph, State, Node, Edge를 코드로 익힙니다.',
  },
  {
    time: '75~95분',
    title: '조건부/병렬 그래프',
    goal: '라우팅, fan-out, reporter 합류 구조를 만듭니다.',
  },
  {
    time: '95~115분',
    title: '로컬 우선 MAS + RAG fallback',
    goal: 'DB/CSV/Web/RAG Agent를 조합하고 부족한 정보를 RAG로 보강합니다.',
  },
  {
    time: '115~120분',
    title: '고도화 포인트 정리',
    goal: 'LangSmith, 평가, 관측성, RRF를 실습 확장 관점으로 연결합니다.',
  },
];

export const AI_AGENT_BLOOM_SESSION_STYLE_OPTIONS: AdminNightOption<AdminNightProgramSessionStyle>[] = [
  {
    value: 'LECTURE',
    label: '강의 중심',
    description: '설명과 코드 흐름을 차근차근 따라가는 방식이 좋아요.',
  },
  {
    value: 'WORKSHOP',
    label: '실습 중심',
    description: '직접 실행하고 중간중간 같이 고치는 시간이 많으면 좋아요.',
  },
  {
    value: 'NETWORKING',
    label: '네트워킹 중심',
    description: '사례 공유와 Q&A, 서로 하는 일 이야기 비중이 높으면 좋아요.',
  },
  {
    value: 'MIXED',
    label: '섞어서',
    description: '강의로 개념을 잡고, 실습과 네트워킹을 적당히 섞으면 좋아요.',
  },
];

export const AI_AGENT_BLOOM_SESSION_LENGTH_OPTIONS: AdminNightOption<AdminNightProgramSessionLength>[] = [
  {
    value: 'SHORT_90',
    label: '90분',
    description: '핵심 개념과 데모만 압축해서 보고 싶어요.',
  },
  {
    value: 'STANDARD_120',
    label: '2시간',
    description: '개념, 코드, Q&A까지 한 번에 보기 적당해요.',
  },
  {
    value: 'HALF_DAY',
    label: '반나절',
    description: '실습과 네트워킹까지 여유 있게 하고 싶어요.',
  },
  {
    value: 'SERIES',
    label: '짧은 연속 세션',
    description: '한 번에 길게보다 2~3회로 나눠 듣고 싶어요.',
  },
];

export const AI_AGENT_BLOOM_FOOD_OPTIONS: AdminNightOption<AdminNightProgramFoodPreference>[] = [
  {
    value: 'NO_NEED',
    label: '없어도 됨',
    description: '내용만 집중해서 진행해도 괜찮아요.',
  },
  {
    value: 'DRINKS_ONLY',
    label: '음료 정도',
    description: '커피나 음료만 있으면 충분해요.',
  },
  {
    value: 'LIGHT_SNACK',
    label: '가벼운 간식',
    description: '중간 쉬는 시간에 먹을 간식이 있으면 좋아요.',
  },
  {
    value: 'MEAL',
    label: '식사도 원함',
    description: '네트워킹까지 한다면 식사와 함께해도 좋아요.',
  },
];
