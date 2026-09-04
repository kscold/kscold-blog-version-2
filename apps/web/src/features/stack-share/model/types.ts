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
  contactPhone: string;
  /** 알림톡에 실제로 나갈 문자열 (예: "토스뱅크 1000-1234-5678 (김승찬)") */
  displayText: string;
  /** 하이픈이 들어간 연락처 표기 (예: "010-1234-5678") */
  contactText: string;
  configured: boolean;
}

export interface StackShareAccountInput {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  contactPhone: string;
}

/** 자주 함께 정산하는 사람 묶음 */
export interface StackShareGroup {
  id: string;
  name: string;
  /** 이 그룹으로 정산할 때 기본으로 채울 서비스명 */
  defaultToolName?: string;
  /** 결제한 본인도 인원에 넣을지 기본값 */
  includeOwner: boolean;
  participantIds: string[];
}

export interface StackShareGroupInput {
  id?: string;
  name: string;
  defaultToolName?: string;
  includeOwner: boolean;
  participantIds: string[];
}

export interface StackShareSettlementPayload {
  toolName: string;
  billingPeriod: string;
  totalAmount: number;
  /** 입금 기한. 비우면 알림톡에 "협의"로 나감 */
  dueDate?: string;
  /** 결제한 본인도 분담 인원에 넣을지 여부. 넣으면 (받는 사람 + 1)로 나눈다 */
  includeOwner: boolean;
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
  /** 발송 당시 안내한 문의 연락처 (스냅샷) */
  contactText?: string;
  /** 총액을 나눈 인원 수. 본인을 포함했다면 받는 사람 수 + 1 */
  shareCount?: number;
  /** 본인도 분담 인원에 넣었는지 여부 */
  includeOwner?: boolean;
  /** 본인 몫. 본인을 포함했을 때만 0보다 큼 */
  ownerAmount?: number;
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
