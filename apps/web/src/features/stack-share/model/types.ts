export interface StackShareParticipant {
  id: string;
  name: string;
  phoneNumber: string;
  email: string;
  userId: string;
}

export interface StackShareParticipantInput {
  id?: string;
  name: string;
  phoneNumber: string;
  email?: string;
  userId?: string;
}

export interface StackShareAccount {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  /** 알림톡에 실제로 나갈 문자열 (예: "카카오뱅크 3333-01-1234567 (김승찬)") */
  displayText: string;
  configured: boolean;
}

export interface StackShareAccountInput {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}

export interface StackShareSettlementPayload {
  toolName: string;
  billingPeriod: string;
  totalAmount: number;
  /** 입금 기한. 비우면 알림톡에 "협의"로 나감 */
  dueDate?: string;
  recipients: Array<Pick<StackShareParticipant, 'name' | 'phoneNumber' | 'email'>>;
}

export interface StackShareSendResult {
  groupId: string;
  requestedCount: number;
  acceptedCount: number;
}

export interface StackShareSettlement {
  id: string;
  toolName: string;
  billingPeriod: string;
  totalAmount: number;
  dueDate?: string;
  /** 발송 당시 안내한 입금 계좌 (스냅샷) */
  accountText?: string;
  status: 'DRAFT' | 'SENT' | 'FAILED';
  sentAt?: string;
  createdAt?: string;
  recipients: Array<{
    participantId: string;
    name: string;
    phoneNumber: string;
    amount: number;
  }>;
}
