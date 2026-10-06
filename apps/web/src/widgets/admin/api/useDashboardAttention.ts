'use client';

import { useQuery } from '@tanstack/react-query';
import { useAdminNightRequests } from '@/entities/admin-night';
import { useStackShareSettlements } from '@/features/stack-share';
import { apiClient } from '@/shared/api/api-client';

export interface AttentionItem {
  key: string;
  label: string;
  hint: string;
  href: string;
  count: number;
}

interface AttentionSource {
  key: string;
  label: string;
  hint: string;
  href: string;
  /** 불러오지 못했으면 undefined. 틀린 0건을 보여주지 않으려고 구분한다. */
  count: number | undefined;
}

/**
 * 대시보드 첫 줄에 올릴 "지금 처리할 일"을 모은다.
 * 건수를 못 불러온 항목은 빼고, 실제로 남은 일이 있는 항목만 돌려준다.
 */
export function useDashboardAttention() {
  const accessRequests = useQuery({
    queryKey: ['admin', 'access-requests', 'pending-count'],
    queryFn: () => apiClient.get<Array<{ status: string }>>('/admin/access-requests'),
  });
  const adminNight = useAdminNightRequests('PENDING');
  const settlements = useStackShareSettlements();

  const sources: AttentionSource[] = [
    {
      key: 'access-requests',
      label: '열람 요청',
      hint: '승인을 기다리는 요청',
      href: '/admin/access-requests',
      count: accessRequests.data?.filter(request => request.status === 'PENDING').length,
    },
    {
      key: 'admin-night',
      label: 'Admin Night 신청',
      hint: '검토를 기다리는 신청',
      href: '/admin/admin-night',
      count: adminNight.data?.length,
    },
    {
      key: 'stack-share',
      label: '공동 구독 정산',
      hint: '입금 확인이 남은 정산',
      href: '/admin/stack-share',
      count: settlements.data?.filter(
        settlement => settlement.status === 'SENT' && !settlement.settledAt
      ).length,
    },
  ];

  const items: AttentionItem[] = sources.flatMap(source =>
    source.count !== undefined && source.count > 0 ? [{ ...source, count: source.count }] : []
  );

  return {
    items,
    isLoading: accessRequests.isLoading || adminNight.isLoading || settlements.isLoading,
  };
}
