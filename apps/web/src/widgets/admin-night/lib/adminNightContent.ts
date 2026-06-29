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
    description: '어떤 흐름으로 볼지, 어느 정도까지 실습할지 먼저 열어둡니다.',
    state: 'next',
  },
  {
    id: 'vote',
    label: '02',
    title: '관심 투표',
    description: '듣고 싶은 사람과 가능한 요일, 원하는 진행 방식을 먼저 모읍니다.',
    state: 'active',
  },
  {
    id: 'schedule',
    label: '03',
    title: '일정 확정',
    description: '관심이 충분히 모이면 날짜, 장소, 준비물, 참가비를 따로 안내합니다.',
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
    label: '같이 만들어보고 싶어요',
    description: 'AI Agent를 직접 만들고, 서로의 아이디어를 나눠보고 싶어요.',
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
