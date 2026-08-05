'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { stackShareApi } from './stackShareApi';

const PARTICIPANTS_KEY = ['admin', 'stack-share', 'participants'];
const SETTLEMENTS_KEY = ['admin', 'stack-share', 'settlements'];

export function useStackShareParticipants() {
  return useQuery({ queryKey: PARTICIPANTS_KEY, queryFn: stackShareApi.getParticipants });
}

export function useStackShareSettlements() {
  return useQuery({ queryKey: SETTLEMENTS_KEY, queryFn: stackShareApi.getSettlements });
}

export function useSaveStackShareParticipant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: stackShareApi.saveParticipant,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PARTICIPANTS_KEY }),
  });
}

export function useDeleteStackShareParticipant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: stackShareApi.deleteParticipant,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PARTICIPANTS_KEY }),
  });
}

export function useSendStackShareSettlement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: stackShareApi.sendSettlement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PARTICIPANTS_KEY });
      queryClient.invalidateQueries({ queryKey: SETTLEMENTS_KEY });
    },
  });
}
