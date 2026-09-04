'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { stackShareApi } from './stackShareApi';

const PARTICIPANTS_KEY = ['admin', 'stack-share', 'participants'];
const SETTLEMENTS_KEY = ['admin', 'stack-share', 'settlements'];
const ACCOUNT_KEY = ['admin', 'stack-share', 'account'];
const GROUPS_KEY = ['admin', 'stack-share', 'groups'];

export function useStackShareAccount() {
  return useQuery({ queryKey: ACCOUNT_KEY, queryFn: stackShareApi.getAccount });
}

export function useSaveStackShareAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: stackShareApi.saveAccount,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ACCOUNT_KEY }),
  });
}

export function useStackShareGroups() {
  return useQuery({ queryKey: GROUPS_KEY, queryFn: stackShareApi.getGroups });
}

export function useSaveStackShareGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: stackShareApi.saveGroup,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: GROUPS_KEY }),
  });
}

export function useDeleteStackShareGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: stackShareApi.deleteGroup,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: GROUPS_KEY }),
  });
}

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
