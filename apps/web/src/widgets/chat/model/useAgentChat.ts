'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '@/entities/user';
import {
  AGENT_QUESTION_MAX_LENGTH,
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
  const viewerId = useAuthStore(state => state.user?.id ?? null);
  const historyViewerRef = useRef(viewerId);
  const isViewerCurrent = historyViewerRef.current === viewerId;
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
  const historyVersionRef = useRef(0);
  const lastQuestionRef = useRef('');
  const { flushPendingDelta, queueDelta, resetBuffer } = useAgentStreamBuffer(setAgentMessages);

  const lastAgentMessage = agentMessages[agentMessages.length - 1];
  const dynamicFollowUps =
    lastAgentMessage?.role === 'assistant' && lastAgentMessage.followUps?.length
      ? lastAgentMessage.followUps
      : [];
  const hasUserAsked = agentMessages.some(message => message.role === 'user');
  const isFollowUp = dynamicFollowUps.length > 0;
  const suggestions = isFollowUp ? dynamicFollowUps : hasUserAsked ? [] : starterPrompts;
  const isAgentHistoryLoading = isOpen && (!hasLoadedAgentHistory || !isViewerCurrent);

  useEffect(() => {
    if (historyViewerRef.current === viewerId) return;
    historyViewerRef.current = viewerId;
    historyVersionRef.current += 1;
    streamAbortControllerRef.current?.abort('identity');
    streamAbortControllerRef.current = undefined;
    resetBuffer();
    lastQuestionRef.current = '';
    setAgentSessionId(resetAgentSessionId());
    setHasLoadedAgentHistory(false);
    setAgentContentScope(undefined);
    setAgentMessages(createInitialAgentMessages());
    setAgentInput('');
    setIsAgentThinking(false);
    setIsSuggestionsOpen(true);
  }, [viewerId, resetBuffer]);

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
  }, [isOpen, viewerId]);

  useEffect(() => {
    if (!isOpen || hasLoadedAgentHistory) {
      return;
    }

    const sessionId = getOrCreateAgentSessionId();
    const historyVersion = ++historyVersionRef.current;
    setAgentSessionId(sessionId);

    void fetchVaultAgentHistory(sessionId)
      .then(history => {
        if (historyVersion !== historyVersionRef.current) return;
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
      .finally(() => {
        if (historyVersion === historyVersionRef.current) setHasLoadedAgentHistory(true);
      });
    return () => {
      historyVersionRef.current += 1;
    };
  }, [hasLoadedAgentHistory, isOpen, viewerId]);

  useEffect(() => {
    if (isOpen) {
      return;
    }
    streamAbortControllerRef.current?.abort('closed');
  }, [isOpen]);

  useEffect(() => {
    return () => {
      streamAbortControllerRef.current?.abort('closed');
    };
  }, []);

  const submitAgentQuestion = async (rawQuestion: string) => {
    const question = rawQuestion.trim();
    if (
      !question || question.length > AGENT_QUESTION_MAX_LENGTH ||
      streamAbortControllerRef.current || !hasLoadedAgentHistory || !isViewerCurrent
    ) {
      return;
    }

    const sessionId = agentSessionId || getOrCreateAgentSessionId();
    const assistantMessageId = `assistant-stream-${Date.now()}`;
    const abortController = new AbortController();
    let completedResponse: VaultAgentChatResponse | undefined;

    resetBuffer();
    streamAbortControllerRef.current = abortController;
    lastQuestionRef.current = question;
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
          if (abortController.signal.aborted) return;
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

      if (!completedResponse) {
        throw new Error('Agent 응답이 끝까지 전달되지 않았습니다.');
      }
    } catch (error) {
      flushPendingDelta(assistantMessageId);
      setAgentMessages(previous =>
        abortController.signal.aborted
          ? interruptAgentMessage(
              previous, assistantMessageId, abortController.signal.reason === 'user'
            )
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
    if (streamAbortControllerRef.current) {
      return;
    }
    historyVersionRef.current += 1;
    lastQuestionRef.current = '';
    const newSessionId = resetAgentSessionId();
    setAgentSessionId(newSessionId);
    setAgentMessages(createInitialAgentMessages(agentContentScope));
    setAgentInput('');
    setIsSuggestionsOpen(true);
    setHasLoadedAgentHistory(true);
  };

  const canStartNewChat = agentMessages.some(message => message.role === 'user');
  const canRetryLastQuestion = !isAgentThinking && !isAgentHistoryLoading &&
    Boolean(lastQuestionRef.current) &&
    (lastAgentMessage?.responseStatus === 'error' || lastAgentMessage?.responseStatus === 'interrupted');
  const cancelAgentResponse = () => streamAbortControllerRef.current?.abort('user');
  const retryLastQuestion = () => {
    if (canRetryLastQuestion) void submitAgentQuestion(lastQuestionRef.current);
  };

  return {
    agentMessages: isViewerCurrent ? agentMessages : createInitialAgentMessages(),
    agentContentScope: isViewerCurrent ? agentContentScope : undefined,
    isAgentThinking: isViewerCurrent && isAgentThinking,
    isAgentHistoryLoading,
    agentInput: isViewerCurrent ? agentInput : '',
    setAgentInput,
    submitAgentQuestion,
    suggestions: isViewerCurrent ? suggestions : starterPrompts,
    isFollowUp,
    isSuggestionsOpen,
    setIsSuggestionsOpen,
    startNewChat,
    canStartNewChat: isViewerCurrent && canStartNewChat,
    cancelAgentResponse,
    retryLastQuestion,
    canRetryLastQuestion: isViewerCurrent && canRetryLastQuestion,
  };
}
