export const FEED_COPILOT_MEMO_MAX_LENGTH = 4_000;

export function getFeedCopilotMemoError(memo: string): string | null {
  if (memo.length <= FEED_COPILOT_MEMO_MAX_LENGTH) {
    return null;
  }
  return 'Agent 메모는 최대 4,000자까지 입력할 수 있습니다.';
}
