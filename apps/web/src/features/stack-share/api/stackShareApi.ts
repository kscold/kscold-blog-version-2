import { apiClient } from '@/shared/api/api-client';
import type {
  StackShareAccount,
  StackShareAccountInput,
  StackShareGroup,
  StackShareGroupInput,
  StackShareParticipant,
  StackShareParticipantInput,
  StackShareSendResult,
  StackShareSettlement,
  StackShareSettlementPayload,
} from '../model/types';

export const stackShareApi = {
  getAccount: () => apiClient.get<StackShareAccount>('/admin/stack-share/account'),
  saveAccount: (input: StackShareAccountInput) =>
    apiClient.post<StackShareAccount>('/admin/stack-share/account', input),
  getParticipants: () =>
    apiClient.get<StackShareParticipant[]>('/admin/stack-share/participants'),
  saveParticipant: (input: StackShareParticipantInput) =>
    apiClient.post<StackShareParticipant>('/admin/stack-share/participants', input),
  deleteParticipant: (id: string) =>
    apiClient.delete<void>('/admin/stack-share/participants', { params: { id } }),
  getGroups: () => apiClient.get<StackShareGroup[]>('/admin/stack-share/groups'),
  saveGroup: (input: StackShareGroupInput) =>
    apiClient.post<StackShareGroup>('/admin/stack-share/groups', input),
  deleteGroup: (id: string) =>
    apiClient.delete<void>('/admin/stack-share/groups', { params: { id } }),
  getSettlements: () =>
    apiClient.get<StackShareSettlement[]>('/admin/stack-share/settlements'),
  sendSettlement: (payload: StackShareSettlementPayload) =>
    apiClient.post<StackShareSendResult>('/admin/stack-share/settlements/send', payload),
};
