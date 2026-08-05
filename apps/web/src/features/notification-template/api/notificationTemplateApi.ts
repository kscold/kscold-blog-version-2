import { apiClient } from '@/shared/api/api-client';
import type { AlimtalkTemplate, AlimtalkTemplateUpdate } from '../model/types';

export const notificationTemplateApi = {
  getTemplates: () =>
    apiClient.get<AlimtalkTemplate[]>('/admin/notification-templates'),
  updateTemplate: (templateKey: string, input: AlimtalkTemplateUpdate) =>
    apiClient.put<AlimtalkTemplate>(
      `/admin/notification-templates/${templateKey}`,
      input
    ),
};
