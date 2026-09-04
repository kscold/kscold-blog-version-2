'use client';

import { useQuery } from '@tanstack/react-query';
import { messageDeliveryApi, type MessageDeliveryQuery } from './messageDeliveryApi';

export function useMessageDeliveries(query: MessageDeliveryQuery) {
  return useQuery({
    queryKey: ['admin', 'message-deliveries', query],
    queryFn: () => messageDeliveryApi.getLogs(query),
  });
}

/**
 * 알림톡이 실제로 단말에 닿았는지 공급자에게 물어본다.
 * 우리 기록은 "보냈다"까지만 알고 있어서, 도달 여부와 실패 사유는 여기서만 확인된다.
 */
export function useMessageDeliveryStatus(providerGroupId: string | null) {
  return useQuery({
    queryKey: ['admin', 'message-delivery-status', providerGroupId],
    queryFn: () => messageDeliveryApi.getProviderStatus(providerGroupId as string),
    enabled: Boolean(providerGroupId),
  });
}
