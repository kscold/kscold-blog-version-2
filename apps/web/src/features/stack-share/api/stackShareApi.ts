import { apiClient } from '@/shared/api/api-client';
import type {
  StackShareParticipant,
  StackShareParticipantInput,
  StackShareSendResult,
  StackShareSettlement,
  StackShareSettlementPayload,
} from '../model/types';

export const stackShareApi = {
  getParticipants: () =>
    apiClient.get<StackShareParticipant[]>('/admin/stack-share/participants'),
  saveParticipant: (input: StackShareParticipantInput) =>
    apiClient.post<StackShareParticipant>('/admin/stack-share/participants', input),
  deleteParticipant: (id: string) =>
    apiClient.delete<void>('/admin/stack-share/participants', { params: { id } }),
  getSettlements: () =>
    apiClient.get<StackShareSettlement[]>('/admin/stack-share/settlements'),
  sendSettlement: (payload: StackShareSettlementPayload) =>
    apiClient.post<StackShareSendResult>('/admin/stack-share/settlements/send', payload),
};
