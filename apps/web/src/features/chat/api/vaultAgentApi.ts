'use client';

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

export async function streamVaultAgentMessage(
  message: string,
  activeFolderName: string | undefined,
  sessionId: string,
  onEvent: (event: VaultAgentStreamEvent) => void,
  signal?: AbortSignal
) {
  const accessToken = await apiClient.getValidToken();
  const response = await fetch(`${resolveApiBaseUrl()}/vault/agent/chat/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify({
      message,
      activeFolderName,
      sessionId,
    }),
    signal,
  });

  if (!response.ok || !response.body) {
    const errorMessage = await response.text().catch(() => '');
    throw new Error(errorMessage || 'Agent 응답 연결을 시작하지 못했습니다.');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  const consumePacket = (packet: string) => {
    const lines = packet.split(/\r?\n/);
    const eventName = lines
      .find(line => line.startsWith('event:'))
      ?.slice('event:'.length)
      .trim();
    const rawData = lines
      .filter(line => line.startsWith('data:'))
      .map(line => line.slice('data:'.length).trimStart())
      .join('\n');

    if (!eventName || !rawData) {
      return;
    }

    const payload = parseStreamPayload(rawData);
    if (eventName === 'stage' && isStage(payload)) {
      onEvent({ type: 'stage', stage: payload });
      return;
    }
    if (eventName === 'delta' && isRecord(payload) && typeof payload.delta === 'string') {
      onEvent({ type: 'delta', delta: payload.delta });
      return;
    }
    if (eventName === 'complete' && isChatResponse(payload)) {
      onEvent({ type: 'complete', response: payload });
      return;
    }
    if (eventName === 'error' && isRecord(payload)) {
      onEvent({
        type: 'error',
        message: typeof payload.message === 'string' ? payload.message : '응답을 만들지 못했습니다.',
      });
    }
  };

  try {
    while (true) {
      const { done, value } = await reader.read();
      buffer += decoder.decode(value, { stream: !done });

      let separatorIndex = buffer.search(/\r?\n\r?\n/);
      while (separatorIndex >= 0) {
        const packet = buffer.slice(0, separatorIndex);
        const separatorLength = buffer[separatorIndex] === '\r' ? 4 : 2;
        buffer = buffer.slice(separatorIndex + separatorLength);
        consumePacket(packet);
        separatorIndex = buffer.search(/\r?\n\r?\n/);
      }

      if (done) {
        if (buffer.trim()) {
          consumePacket(buffer);
        }
        return;
      }
    }
  } finally {
    reader.releaseLock();
  }
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

function parseStreamPayload(rawData: string): unknown {
  try {
    const parsed = JSON.parse(rawData);
    if (typeof parsed === 'string') {
      try {
        return JSON.parse(parsed);
      } catch {
        return parsed;
      }
    }
    return parsed;
  } catch {
    return rawData;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isStage(value: unknown): value is VaultAgentStage {
  return (
    isRecord(value) &&
    typeof value.name === 'string' &&
    typeof value.detail === 'string'
  );
}

function isChatResponse(value: unknown): value is VaultAgentChatResponse {
  return (
    isRecord(value) &&
    typeof value.answer === 'string' &&
    Array.isArray(value.stages) &&
    Array.isArray(value.sources) &&
    Array.isArray(value.followUps)
  );
}
