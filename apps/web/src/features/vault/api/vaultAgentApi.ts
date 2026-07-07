'use client';

import apiClient from '@/shared/api/api-client';
import type { PageResponse } from '@/types/api';

export interface VaultAgentStage {
  name: string;
  detail: string;
}

export interface VaultAgentSource {
  id: string;
  title: string;
  slug: string;
  score: number;
  type?: string;
  path?: string;
}

export interface VaultAgentChatResponse {
  answer: string;
  stages: VaultAgentStage[];
  sources: VaultAgentSource[];
}

export interface VaultAgentRun {
  id: string;
  question: string;
  answerPreview: string;
  sourceCount: number;
  sources: VaultAgentSource[];
  createdAt?: string;
}

export function sendVaultAgentMessage(message: string, activeFolderName?: string) {
  return apiClient.post<VaultAgentChatResponse>('/vault/agent/chat', {
    message,
    activeFolderName,
  });
}

export function fetchVaultAgentRuns(page: number = 0, size: number = 10) {
  return apiClient.get<PageResponse<VaultAgentRun>>(`/admin/vault/agent/runs?page=${page}&size=${size}`);
}
