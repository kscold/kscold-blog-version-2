'use client';

import { useEffect, useRef, useState } from 'react';
import {
  fetchVaultAgentContentScope,
  fetchVaultAgentHistory,
  streamVaultAgentMessage,
  type VaultAgentChatResponse,
  type VaultAgentContentScope,
  type VaultAgentStage,
} from '@/features/chat/api/vaultAgentApi';
import {
  AGENT_SESSION_STORAGE_KEY,
  getOrCreateAgentSessionId,
  resetAgentSessionId,
} from '@/features/chat/lib/agentSession';
import {
  createInitialAgentMessages,
  starterPrompts,
  type AgentMessage,
} from '@/features/chat/lib/agentConstants';
import { useAgentStreamBuffer } from '@/features/chat/model/useAgentStreamBuffer';

const INITIAL_STREAM_STAGE: VaultAgentStage = {
  name: '질문 정리',
  detail: '질문의 핵심과 필요한 기록 범위를 정리하고 있습니다.',
};

export function useAgentChat(isOpen: boolean) {
  const [agentInput, setAgentInput] = useState('');
  const [agentSessionId, setAgentSessionId] = useState('');
  const [isAgentThinking, setIsAgentThinking] = useState(false);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(true);
  const [hasLoadedAgentHistory, setHasLoadedAgentHistory] = useState(false);
  const [agentContentScope, setAgentContentScope] = useState<VaultAgentContentScope>();
  const [agentMessages, setAgentMessages] = useState<AgentMessage[]>(() =>
    createInitialAgentMessages()
  );
  const streamAbortControllerRef = useRef<AbortController | undefined>(undefined);
  const { flushPendingDelta, queueDelta, resetBuffer } = useAgentStreamBuffer(setAgentMessages);

  const lastAgentMessage = agentMessages[agentMessages.length - 1];
  const dynamicFollowUps =
    lastAgentMessage?.role === 'assistant' && lastAgentMessage.followUps?.length
      ? lastAgentMessage.followUps
      : [];
  const hasUserAsked = agentMessages.some(message => message.role === 'user');
  const isFollowUp = dynamicFollowUps.length > 0;
  const suggestions = isFollowUp ? dynamicFollowUps : hasUserAsked ? [] : starterPrompts;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let isCurrent = true;
    void fetchVaultAgentContentScope()
      .then(scope => {
        if (!isCurrent) {
          return;
        }
        setAgentContentScope(scope);
        setAgentMessages(previous =>
          previous.some(message => message.role === 'user')
            ? previous
            : createInitialAgentMessages(scope)
        );
      })
      .catch(() => undefined);

    return () => {
      isCurrent = false;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || hasLoadedAgentHistory) {
      return;
    }

    const sessionId = getOrCreateAgentSessionId();
    setAgentSessionId(sessionId);

    void fetchVaultAgentHistory(sessionId)
      .then(history => {
        if (history.sessionId && history.sessionId !== sessionId) {
          window.localStorage.setItem(AGENT_SESSION_STORAGE_KEY, history.sessionId);
          setAgentSessionId(history.sessionId);
        }

        if (history.messages.length > 0) {
          setAgentMessages(
            history.messages.map(message => ({
              id: message.id,
              role: message.role,
              content: message.content,
              stages: message.stages,
              sources: message.sources,
            }))
          );
        }
      })
      .catch(() => undefined)
      .finally(() => setHasLoadedAgentHistory(true));
  }, [hasLoadedAgentHistory, isOpen]);

  useEffect(() => {
    if (isOpen) {
      return;
    }
    streamAbortControllerRef.current?.abort();
  }, [isOpen]);

  useEffect(() => {
    return () => {
      streamAbortControllerRef.current?.abort();
    };
  }, []);

  const submitAgentQuestion = async (rawQuestion: string) => {
    const question = rawQuestion.trim();
    if (!question || isAgentThinking) {
      return;
    }

    const sessionId = agentSessionId || getOrCreateAgentSessionId();
    const assistantMessageId = `assistant-stream-${Date.now()}`;
    const abortController = new AbortController();
    let completedResponse: VaultAgentChatResponse | undefined;

    streamAbortControllerRef.current?.abort();
    resetBuffer();
    streamAbortControllerRef.current = abortController;
    setAgentSessionId(sessionId);
    setAgentMessages(previous => [
      ...previous,
      {
        id: `local-user-${Date.now()}`,
        role: 'user',
        content: question,
      },
      {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        stages: [INITIAL_STREAM_STAGE],
        isStreaming: true,
      },
    ]);
    setAgentInput('');
    setIsSuggestionsOpen(true);
    setIsAgentThinking(true);

    try {
      await streamVaultAgentMessage(
        question,
        undefined,
        sessionId,
        event => {
          if (event.type === 'stage') {
            setAgentMessages(previous =>
              previous.map(message => {
                if (message.id !== assistantMessageId) {
                  return message;
                }
                const stages = message.stages || [];
                const alreadyAdded = stages.some(
                  stage =>
                    stage.name === event.stage.name && stage.detail === event.stage.detail
                );
                return alreadyAdded ? message : { ...message, stages: [...stages, event.stage] };
              })
            );
            return;
          }

          if (event.type === 'delta') {
            queueDelta(assistantMessageId, event.delta);
            return;
          }

          if (event.type === 'complete') {
            completedResponse = event.response;
            flushPendingDelta(assistantMessageId);
            if (event.response.sessionId && event.response.sessionId !== sessionId) {
              window.localStorage.setItem(AGENT_SESSION_STORAGE_KEY, event.response.sessionId);
              setAgentSessionId(event.response.sessionId);
            }
            setAgentMessages(previous =>
              previous.map(message =>
                message.id === assistantMessageId
                  ? {
                      ...message,
                      content: event.response.answer || message.content,
                      stages: event.response.stages,
                      sources: event.response.sources,
                      followUps: event.response.followUps,
                      isStreaming: false,
                    }
                  : message
              )
            );
            return;
          }

          if (event.type === 'error') {
            throw new Error(event.message);
          }
        },
        abortController.signal
      );

      if (!completedResponse && !abortController.signal.aborted) {
        throw new Error('Agent 응답이 끝까지 전달되지 않았습니다.');
      }
    } catch (error) {
      if (!abortController.signal.aborted) {
        setAgentMessages(previous =>
          previous.map(message =>
            message.id === assistantMessageId
              ? {
                  ...message,
                  content:
                    '지금은 답변을 이어갈 수 없어요. 잠시 뒤 다시 물어봐 주세요.',
                  stages: [
                    {
                      name: '연결 확인',
                      detail:
                        error instanceof Error
                          ? error.message
                          : 'Agent 서버 응답을 받지 못했습니다.',
                    },
                  ],
                  isStreaming: false,
                }
              : message
          )
        );
      }
    } finally {
      flushPendingDelta(assistantMessageId);
      if (streamAbortControllerRef.current === abortController) {
        streamAbortControllerRef.current = undefined;
        setIsAgentThinking(false);
      }
    }
  };

  const startNewChat = () => {
    if (isAgentThinking) {
      return;
    }
    const newSessionId = resetAgentSessionId();
    setAgentSessionId(newSessionId);
    setAgentMessages(createInitialAgentMessages(agentContentScope));
    setAgentInput('');
    setIsSuggestionsOpen(true);
    setHasLoadedAgentHistory(true);
  };

  const canStartNewChat = agentMessages.some(message => message.role === 'user');

  return {
    agentMessages,
    agentContentScope,
    isAgentThinking,
    agentInput,
    setAgentInput,
    submitAgentQuestion,
    suggestions,
    isFollowUp,
    isSuggestionsOpen,
    setIsSuggestionsOpen,
    startNewChat,
    canStartNewChat,
  };
}
