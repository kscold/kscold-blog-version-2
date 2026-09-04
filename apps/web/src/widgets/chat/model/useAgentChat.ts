'use client';

import { useEffect, useRef, useState } from 'react';
import {
  AGENT_SESSION_STORAGE_KEY,
  createInitialAgentMessages,
  fetchVaultAgentContentScope,
  fetchVaultAgentHistory,
  getOrCreateAgentSessionId,
  isValidAgentSessionId,
  resetAgentSessionId,
  starterPrompts,
  streamVaultAgentMessage,
  type AgentMessage,
  type VaultAgentChatResponse,
  type VaultAgentContentScope,
} from '@/features/chat';
import {
  addAgentStage,
  completeAgentMessage,
  failAgentMessage,
  INITIAL_STREAM_STAGE,
  interruptAgentMessage,
} from './agentMessageState';
import { useAgentStreamBuffer } from './useAgentStreamBuffer';

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
  const isAgentHistoryLoading = isOpen && !hasLoadedAgentHistory;

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
        if (isValidAgentSessionId(history.sessionId) && history.sessionId !== sessionId) {
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
    if (!question || isAgentThinking || !hasLoadedAgentHistory) {
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
      await streamVaultAgentMessage({
        question,
        sessionId,
        onEvent: event => {
          if (event.type === 'stage') {
            setAgentMessages(previous =>
              addAgentStage(previous, assistantMessageId, event.stage)
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
            if (
              isValidAgentSessionId(event.response.sessionId) &&
              event.response.sessionId !== sessionId
            ) {
              window.localStorage.setItem(AGENT_SESSION_STORAGE_KEY, event.response.sessionId);
              setAgentSessionId(event.response.sessionId);
            }
            setAgentMessages(previous =>
              completeAgentMessage(previous, assistantMessageId, event.response)
            );
            return;
          }

          if (event.type === 'error') {
            throw new Error(event.message);
          }
        },
        signal: abortController.signal,
      });

      if (!completedResponse && !abortController.signal.aborted) {
        throw new Error('Agent 응답이 끝까지 전달되지 않았습니다.');
      }
    } catch (error) {
      flushPendingDelta(assistantMessageId);
      setAgentMessages(previous =>
        abortController.signal.aborted
          ? interruptAgentMessage(previous, assistantMessageId)
          : failAgentMessage(
              previous,
              assistantMessageId,
              error instanceof Error
                ? error.message
                : 'Agent 서버 응답을 받지 못했습니다.'
            )
      );
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
    isAgentHistoryLoading,
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
