import { apiClient } from '@/shared/api/api-client';
import type { PageResponse } from '@/shared/model/types/api';
import type {
  MessageDeliveryChannel,
  MessageDeliveryLog,
  MessageDeliveryStatus,
  MessageDeliveryStatusCode,
} from '../model/types';

export interface MessageDeliveryQuery {
  channel?: MessageDeliveryChannel;
  status?: MessageDeliveryStatusCode;
  page?: number;
  size?: number;
}

export const messageDeliveryApi = {
  getLogs: (query: MessageDeliveryQuery) =>
    apiClient.get<PageResponse<MessageDeliveryLog>>('/admin/message-deliveries', {
      params: {
        ...(query.channel ? { channel: query.channel } : {}),
        ...(query.status ? { status: query.status } : {}),
        page: query.page ?? 0,
        size: query.size ?? 30,
      },
    }),
  getProviderStatus: (providerGroupId: string) =>
    apiClient.get<MessageDeliveryStatus[]>(
      `/admin/message-deliveries/${providerGroupId}/status`
    ),
};
