'use client';

import apiClient from '@/shared/api/api-client';
import type { PageResponse } from '@/shared/model/types/api';

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
  sessionId: string;
  answer: string;
  stages: VaultAgentStage[];
  sources: VaultAgentSource[];
  /** 대화 흐름을 이어가는 후속질문 추천 (agent 생성) */
  followUps: string[];
}

export interface VaultAgentHistoryMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  stages: VaultAgentStage[];
  sources: VaultAgentSource[];
  createdAt?: string;
}

export interface VaultAgentHistoryResponse {
  sessionId: string;
  messages: VaultAgentHistoryMessage[];
}

export interface VaultAgentRun {
  id: string;
  question: string;
  answerPreview: string;
  sourceCount: number;
  sources: VaultAgentSource[];
  createdAt?: string;
}

export function sendVaultAgentMessage(
  message: string,
  activeFolderName?: string,
  sessionId?: string
) {
  return apiClient.post<VaultAgentChatResponse>(
    '/vault/agent/chat',
    {
      message,
      activeFolderName,
      sessionId,
    },
    { timeout: 65_000 }
  );
}

export function fetchVaultAgentHistory(sessionId: string) {
  return apiClient.get<VaultAgentHistoryResponse>(
    `/vault/agent/history?sessionId=${encodeURIComponent(sessionId)}`
  );
}

export function fetchVaultAgentRuns(page: number = 0, size: number = 10) {
  return apiClient.get<PageResponse<VaultAgentRun>>(
    `/admin/vault/agent/runs?page=${page}&size=${size}`
  );
}
