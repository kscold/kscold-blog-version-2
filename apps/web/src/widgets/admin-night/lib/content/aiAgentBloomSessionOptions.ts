import type {
  AdminNightProgramFoodPreference,
  AdminNightProgramSessionLength,
  AdminNightProgramSessionStyle,
} from '@/entities/admin-night';
import type { AdminNightOption } from './types';

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
