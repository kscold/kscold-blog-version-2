import type { FeedCopilotStyle } from '../api/feedCopilotApi';

export interface FeedCopilotStyleOption {
  id: FeedCopilotStyle;
  label: string;
  description: string;
}

export const feedCopilotStyleOptions: FeedCopilotStyleOption[] = [
  { id: 'short', label: '짧게', description: '핵심만 빠르게' },
  { id: 'developer', label: '개발자답게', description: '구현 맥락을 또렷하게' },
  { id: 'candid', label: '조금 더 솔직하게', description: '확신과 고민을 구분해' },
  { id: 'calm', label: '논쟁적이지 않게', description: '차분하게 정리' },
  { id: 'warm', label: '읽기 편하게', description: '맥락을 부드럽게' },
];
