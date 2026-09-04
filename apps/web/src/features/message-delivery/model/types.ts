export type MessageDeliveryChannel = 'ALIMTALK' | 'EMAIL';
export type MessageDeliveryStatusCode = 'SENT' | 'FAILED';

/** 우리가 남긴 발송 기록 한 줄 */
export interface MessageDeliveryLog {
  id: string;
  channel: MessageDeliveryChannel;
  /** 무엇 때문에 보냈는지. 예: STACK_SHARE_SETTLEMENT */
  purpose: string;
  recipient: string;
  recipientName?: string;
  summary?: string;
  status: MessageDeliveryStatusCode;
  failureReason?: string;
  /** 있으면 공급자에게 실제 도달 상태를 다시 물어볼 수 있다 */
  providerGroupId?: string;
  createdAt: string;
}

/** 공급자(솔라피)에게 물어본 실제 도달 결과 */
export interface MessageDeliveryStatus {
  messageId: string;
  groupId: string;
  recipient: string;
  statusCode: string;
  status: string;
  delivered: boolean;
  /** 실제로 나간 최종 문구 */
  text: string;
  sentAt?: string;
  receivedAt?: string;
  logs: string[];
}
