'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationTemplateApi } from './notificationTemplateApi';
import type { AlimtalkTemplateUpdate } from '../model/types';

const QUERY_KEY = ['admin', 'notification-templates'];

export function useNotificationTemplates() {
  return useQuery({ queryKey: QUERY_KEY, queryFn: notificationTemplateApi.getTemplates });
}

export function useUpdateNotificationTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      templateKey,
      input,
    }: {
      templateKey: string;
      input: AlimtalkTemplateUpdate;
    }) => notificationTemplateApi.updateTemplate(templateKey, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}
