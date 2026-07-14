'use client';

import { useEffect, useState } from 'react';
import {
  fetchVaultAgentHistory,
  sendVaultAgentMessage,
} from '@/features/chat/api/vaultAgentApi';
import {
  AGENT_SESSION_STORAGE_KEY,
  getOrCreateAgentSessionId,
  resetAgentSessionId,
} from '@/features/chat/lib/agentSession';
import {
  INITIAL_AGENT_MESSAGES,
  starterPrompts,
  type AgentMessage,
} from '@/features/chat/lib/agentConstants';

export function useAgentChat(isOpen: boolean) {
  const [agentInput, setAgentInput] = useState('');
  const [agentSessionId, setAgentSessionId] = useState('');
  const [isAgentThinking, setIsAgentThinking] = useState(false);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(true);
  const [hasLoadedAgentHistory, setHasLoadedAgentHistory] = useState(false);
  const [agentMessages, setAgentMessages] = useState<AgentMessage[]>(INITIAL_AGENT_MESSAGES);

  // 대화 전에는 온보딩용 기본 추천질문, 대화 후에는 직전 답변 기반 후속질문(연속성)을 노출한다.
  const lastAgentMessage = agentMessages[agentMessages.length - 1];
  const dynamicFollowUps =
    lastAgentMessage?.role === 'assistant' && lastAgentMessage.followUps?.length
      ? lastAgentMessage.followUps
      : [];
  const hasUserAsked = agentMessages.some(message => message.role === 'user');
  const isFollowUp = dynamicFollowUps.length > 0;
  const suggestions = isFollowUp ? dynamicFollowUps : hasUserAsked ? [] : starterPrompts;

  useEffect(() => {
    if (!isOpen || hasLoadedAgentHistory) {
      return;
    }

    const sessionId = getOrCreateAgentSessionId();
    setAgentSessionId(sessionId);

    fetchVaultAgentHistory(sessionId)
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

  const submitAgentQuestion = async (rawQuestion: string) => {
    const question = rawQuestion.trim();
    if (!question || isAgentThinking) return;
    const sessionId = agentSessionId || getOrCreateAgentSessionId();
    setAgentSessionId(sessionId);

    setAgentMessages(prev => [
      ...prev,
      {
        id: `local-user-${Date.now()}`,
        role: 'user',
        content: question,
      },
    ]);
    setAgentInput('');
    setIsSuggestionsOpen(true);
    setIsAgentThinking(true);

    try {
      const response = await sendVaultAgentMessage(question, 'KSCOLD 공개 콘텐츠', sessionId);
      if (response.sessionId && response.sessionId !== sessionId) {
        window.localStorage.setItem(AGENT_SESSION_STORAGE_KEY, response.sessionId);
        setAgentSessionId(response.sessionId);
      }
      setAgentMessages(prev => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: response.answer,
          stages: response.stages,
          sources: response.sources,
          followUps: response.followUps,
        },
      ]);
    } catch {
      setAgentMessages(prev => [
        ...prev,
        {
          id: `assistant-error-${Date.now()}`,
          role: 'assistant',
          content:
            '지금 Agent 서버 연결이 잠깐 불안정해요. 잠시 뒤 다시 물어봐 주세요. 공개 콘텐츠 검색 기능은 서버가 회복되면 바로 이어집니다.',
          stages: [{ name: '연결 실패', detail: 'Agent gRPC 서버 응답을 받지 못했습니다.' }],
        },
      ]);
    } finally {
      setIsAgentThinking(false);
    }
  };

  const startNewChat = () => {
    if (isAgentThinking) return;
    const newSessionId = resetAgentSessionId();
    setAgentSessionId(newSessionId);
    setAgentMessages(INITIAL_AGENT_MESSAGES);
    setAgentInput('');
    setIsSuggestionsOpen(true);
    setHasLoadedAgentHistory(true);
  };

  const canStartNewChat = agentMessages.some(message => message.role === 'user');

  return {
    agentMessages,
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
