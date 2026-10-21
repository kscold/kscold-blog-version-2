export const RATING_QUESTIONS = [
  { key: 'satisfaction', title: '오늘 강의에 전반적으로 만족하셨나요?' },
  { key: 'understanding', title: '설명과 예시를 이해하기 쉬웠나요?' },
  { key: 'usefulness', title: '배운 내용을 업무에 활용할 수 있을 것 같나요?' },
  { key: 'instruction', title: '강사의 설명과 진행이 도움이 되었나요?' },
] as const;

export const HELPFUL_TOPICS = [
  { key: 'basics', title: 'AI의 원리와 도구 이해' },
  { key: 'prompt', title: 'AI에게 일을 맡기는 방법' },
  { key: 'tools', title: '에이전트·스킬 활용' },
  { key: 'privacy', title: '개인정보 보호' },
  { key: 'practice', title: '업무 자료 실습' },
] as const;

export const PACE_OPTIONS = [
  { key: 'slow', title: '조금 느렸어요' },
  { key: 'right', title: '적당했어요' },
  { key: 'fast', title: '조금 빨랐어요' },
] as const;

export type FeedbackDraft = {
  ratings: Record<string, number>;
  pace: string;
  helpful: string[];
  comment: string;
};
export type FeedbackResponse = FeedbackDraft & { id: string; createdAt: string };
