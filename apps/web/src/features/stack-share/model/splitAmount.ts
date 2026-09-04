export interface SplitInput {
  totalAmount: number;
  /** 알림톡을 받을 사람 수 */
  receiverCount: number;
  /** 결제한 본인도 분담 인원에 넣을지 여부 */
  includeOwner: boolean;
}

export interface SplitResult {
  /** 총액을 나눈 인원 수. 본인을 포함했다면 받는 사람 수 + 1 */
  shareCount: number;
  /** 받는 사람 각자의 분담금. 입력 순서를 그대로 따른다 */
  receiverAmounts: number[];
  /** 본인 몫. 본인을 포함했을 때만 0보다 크다 */
  ownerAmount: number;
}

/**
 * 총액을 인원수로 엔빵한다. 서버(StackShareManagementApplicationService)와 같은 규칙이라
 * 화면에 미리 보여준 금액이 실제 발송 금액과 어긋나지 않는다.
 *
 * 나누어떨어지지 않을 때: 본인을 포함했으면 결제한 본인이 나머지를 떠안고,
 * 본인을 뺐으면 앞사람부터 1원씩 더 부담한다.
 */
export const splitEvenly = ({
  totalAmount,
  receiverCount,
  includeOwner,
}: SplitInput): SplitResult => {
  const shareCount = receiverCount + (includeOwner ? 1 : 0);
  if (receiverCount <= 0 || totalAmount <= 0 || shareCount <= 0) {
    return { shareCount: Math.max(shareCount, 0), receiverAmounts: [], ownerAmount: 0 };
  }

  const base = Math.floor(totalAmount / shareCount);
  const remainder = totalAmount % shareCount;
  const receiverAmounts = Array.from({ length: receiverCount }, (_, index) =>
    includeOwner ? base : base + (index < remainder ? 1 : 0)
  );

  return {
    shareCount,
    receiverAmounts,
    ownerAmount: includeOwner ? base + remainder : 0,
  };
};
