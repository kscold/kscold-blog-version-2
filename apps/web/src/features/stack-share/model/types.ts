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

export interface StackShareSettlementPayload {
  toolName: string;
  billingPeriod: string;
  totalAmount: number;
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
