// 글 본문의 ```interactive 코드 블록에서 쓸 수 있는 데모 이름.
// 블록 첫 줄에 이름을 적으면 그 데모를 그리고, 모르는 이름이면 평범한 코드 블록으로 남긴다.
export const INTERACTIVE_DEMO_IDS = ['replica-set-election', 'shard-key-routing'] as const;

export type InteractiveDemoId = (typeof INTERACTIVE_DEMO_IDS)[number];

function isInteractiveDemoId(value: string): value is InteractiveDemoId {
  return (INTERACTIVE_DEMO_IDS as readonly string[]).includes(value);
}

export function findInteractiveDemoId(codeText: string): InteractiveDemoId | null {
  const firstLine = codeText
    .split('\n')
    .map(line => line.trim())
    .find(line => line.length > 0);

  return firstLine && isInteractiveDemoId(firstLine) ? firstLine : null;
}
