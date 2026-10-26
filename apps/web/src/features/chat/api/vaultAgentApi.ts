'use client';

import { readAgentStream } from './agentStreamTransport';
import apiClient from '@/shared/api/api-client';
import { resolveApiBaseUrl } from '@/shared/lib/runtime-url';
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
  excerpt?: string;
}

export interface VaultAgentChatResponse {
  sessionId: string;
  answer: string;
  stages: VaultAgentStage[];
  sources: VaultAgentSource[];
  /** 대화 흐름을 이어가는 후속질문 추천 (agent 생성) */
  followUps: string[];
}

export interface VaultAgentContentScope {
  label: string;
  description: string;
}

export type VaultAgentStreamEvent =
  | { type: 'stage'; stage: VaultAgentStage }
  | { type: 'delta'; delta: string }
  | { type: 'complete'; response: VaultAgentChatResponse }
  | { type: 'error'; message: string };

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

interface VaultAgentStreamRequest {
  question: string;
  activeFolderName?: string;
  sessionId: string;
  onEvent: (event: VaultAgentStreamEvent) => void;
  signal?: AbortSignal;
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

export async function streamVaultAgentMessage(request: VaultAgentStreamRequest) {
  await readAgentStream({
    url: `${resolveApiBaseUrl()}/vault/agent/chat/stream`,
    body: { message: request.question, activeFolderName: request.activeFolderName, sessionId: request.sessionId },
    onEvent: request.onEvent,
    signal: request.signal,
  });
}

export function fetchVaultAgentContentScope() {
  return apiClient.get<VaultAgentContentScope>('/vault/agent/content-scope');
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
