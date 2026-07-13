import type {
  AdminNightProgramExperienceLevel,
  AdminNightProgramInterestLevel,
  AdminNightProgramPreferredDay,
  AdminNightProgramPreferredFormat,
} from '@/entities/admin-night/model/types';
import type { AdminNightOption, AdminNightProgramPhase } from './types';

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
