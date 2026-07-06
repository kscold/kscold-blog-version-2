'use client';

import apiClient from '@/shared/api/api-client';

export interface VaultAgentStage {
  name: string;
  detail: string;
}

export interface VaultAgentSource {
  id: string;
  title: string;
  slug: string;
  score: number;
}

export interface VaultAgentChatResponse {
  answer: string;
  stages: VaultAgentStage[];
  sources: VaultAgentSource[];
}

export function sendVaultAgentMessage(message: string, activeFolderName?: string) {
  return apiClient.post<VaultAgentChatResponse>('/vault/agent/chat', {
    message,
    activeFolderName,
  });
}
