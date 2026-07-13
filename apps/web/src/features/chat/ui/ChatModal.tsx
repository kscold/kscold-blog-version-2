'use client';

import type { CSSProperties } from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/entities/user/model/authStore';
import {
  fetchVaultAgentHistory,
  sendVaultAgentMessage,
  type VaultAgentSource,
  type VaultAgentStage,
} from '@/features/vault/api/vaultAgentApi';
import { useChatSocket } from '@/features/chat/lib/useChatSocket';
import ChatMessageList from '@/features/chat/ui/ChatMessageList';
import { ChatComposer } from './ChatComposer';
import { ChatModalHeader } from './ChatModalHeader';

interface ChatModalProps {
  isOpen: boolean;
  isElevated?: boolean;
  onClose: () => void;
}

type ChatMode = 'agent' | 'owner';

interface AgentMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  stages?: VaultAgentStage[];
  sources?: VaultAgentSource[];
  followUps?: string[];
}

const AGENT_SESSION_STORAGE_KEY = 'kscold-agent-chat-session-id';

const starterPrompts = [
  '최근 블로그에서 AI Agent 관련 내용 요약해줘',
  '최근 피드에서 눈여겨볼 만한 내용 알려줘',
  '승찬님은 어떤 개발자야?',
  'JavaScript async await 노트 설명해줘',
  'Vault에서 먼저 보면 좋은 노트 알려줘',
];

const sourceHref = (source: VaultAgentSource) => {
  const path = source.path || `/vault/${encodeURIComponent(source.slug)}`;
  return `${path}${path.includes('?') ? '&' : '?'}chat=open`;
};

const createSessionId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const getOrCreateAgentSessionId = () => {
  if (typeof window === 'undefined') {
    return createSessionId();
  }

  const savedSessionId = window.localStorage.getItem(AGENT_SESSION_STORAGE_KEY);
  if (savedSessionId) {
    return savedSessionId;
  }

  const nextSessionId = createSessionId();
  window.localStorage.setItem(AGENT_SESSION_STORAGE_KEY, nextSessionId);
  return nextSessionId;
};

export default function ChatModal({ isOpen, isElevated = false, onClose }: ChatModalProps) {
  const { user } = useAuthStore();
  const [inputMessage, setInputMessage] = useState('');
  const [agentInput, setAgentInput] = useState('');
  const [agentSessionId, setAgentSessionId] = useState('');
  const [mode, setMode] = useState<ChatMode>('agent');
  const [isAgentThinking, setIsAgentThinking] = useState(false);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(true);
  const [hasLoadedAgentHistory, setHasLoadedAgentHistory] = useState(false);
  const [agentMessages, setAgentMessages] = useState<AgentMessage[]>([
    {
      id: 'initial-agent-greeting',
      role: 'assistant',
      content:
        '안녕하세요. 승찬님이 공개해둔 블로그 글, 피드, Vault 노트, Info 프로필을 함께 찾아 답하는 KSCOLD Agent예요. 비로그인 상태에서는 공개된 콘텐츠만 근거로 사용합니다.',
        stages: [
        { name: '검색', detail: '블로그·피드·Vault·Info에서 질문과 가까운 근거를 찾습니다.' },
        { name: '연결', detail: 'Vault 링크와 백링크로 필요한 경우 주변 맥락을 넓힙니다.' },
        { name: '보강', detail: '최신 정보가 필요한 질문은 웹검색으로 내용을 보강합니다.' },
        { name: '정리', detail: '답변과 함께 바로 열 수 있는 출처를 남깁니다.' },
      ],
    },
  ]);

  const username = user?.displayName || user?.username || '';
  const { messages, isConnected, sendMessage } = useChatSocket({
    isOpen: isOpen && !!user && mode === 'owner',
    username,
  });
  const modalPositionStyle = {
    '--chat-modal-bottom': isElevated
      ? 'calc(env(safe-area-inset-bottom, 0px) + 7.75rem)'
      : 'calc(env(safe-area-inset-bottom, 0px) + 2rem)',
    '--chat-modal-max-height': isElevated
      ? 'calc(100dvh - env(safe-area-inset-bottom, 0px) - 9.25rem)'
      : 'calc(100dvh - env(safe-area-inset-bottom, 0px) - 2.5rem)',
  } as CSSProperties;

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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    await sendMessage(inputMessage);
    setInputMessage('');
  };

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

  const handleSendAgentMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    void submitAgentQuestion(agentInput);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 오버레이 */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1300]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* 모달: 모바일 전체화면 / 데스크탑 우하단 고정 */}
          <motion.div
            className="fixed z-[1400] flex min-h-0 flex-col overflow-hidden border border-surface-200 bg-white shadow-2xl
                       inset-x-2 bottom-2 h-[calc(100dvh-0.5rem)] max-h-[calc(100dvh-0.5rem)] rounded-[24px]
                       sm:inset-x-auto sm:bottom-[var(--chat-modal-bottom)] sm:right-4 sm:h-[720px] sm:max-h-[var(--chat-modal-max-height)] sm:w-[min(440px,calc(100vw-2rem))] sm:min-h-[480px] sm:min-w-[360px] sm:max-w-[calc(100vw-2rem)] sm:resize sm:rounded-[24px]"
            style={modalPositionStyle}
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 80 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            onClick={e => e.stopPropagation()}
          >
            <ChatModalHeader
              isConnected={mode === 'agent' || isConnected}
              title={mode === 'agent' ? 'KSCOLD Agent와 대화' : '블로그 주인과 대화'}
              subtitle={mode === 'agent' ? '공개 콘텐츠 RAG 모드' : undefined}
              onClose={onClose}
            />

            <div className="grid shrink-0 grid-cols-2 gap-2 border-b border-surface-200 bg-white px-3 py-2.5 sm:px-4 sm:py-3">
              <button
                type="button"
                onClick={() => setMode('agent')}
                className={`min-w-0 rounded-xl px-2 py-2 text-xs font-black transition sm:px-3 ${
                  mode === 'agent'
                    ? 'bg-surface-900 text-white'
                    : 'bg-surface-50 text-surface-500 hover:bg-surface-100 hover:text-surface-900'
                }`}
              >
                Agent에게 묻기
              </button>
              <button
                type="button"
                onClick={() => setMode('owner')}
                className={`min-w-0 rounded-xl px-2 py-2 text-xs font-black transition sm:px-3 ${
                  mode === 'owner'
                    ? 'bg-surface-900 text-white'
                    : 'bg-surface-50 text-surface-500 hover:bg-surface-100 hover:text-surface-900'
                }`}
              >
                주인에게 남기기
              </button>
            </div>

            {/* 본문 */}
            {mode === 'agent' ? (
              <>
                <AgentMessageList messages={agentMessages} isThinking={isAgentThinking} />
                <div className="shrink-0 border-t border-surface-200 bg-white p-3 sm:p-4">
                  {suggestions.length > 0 && (
                    <div className="mb-2.5">
                      <button
                        type="button"
                        onClick={() => setIsSuggestionsOpen(open => !open)}
                        className="mb-2 flex w-full items-center justify-between gap-2 text-surface-400 transition hover:text-surface-600"
                      >
                        <span className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.12em]">
                          {isFollowUp ? (
                            <svg
                              className="h-3.5 w-3.5 text-cyan-500"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 3v4M3 5h4M6 17v4m-2-2h4m6-13l2.4 6.6L24 15l-6.6 2.4L15 24l-2.4-6.6L6 15l6.6-2.4L15 6z"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="h-3.5 w-3.5 text-amber-500"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                              />
                            </svg>
                          )}
                          {isFollowUp ? '이어서 물어보기' : '추천 질문'}
                        </span>
                        <svg
                          className={`h-4 w-4 transition-transform duration-200 ${isSuggestionsOpen ? 'rotate-180' : ''}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2.5}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <AnimatePresence initial={false}>
                        {isSuggestionsOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: 'easeOut' }}
                            className="overflow-hidden"
                          >
                            <div className="flex flex-wrap gap-1.5 pb-1 sm:gap-2">
                              {suggestions.map((prompt, index) => (
                                <motion.button
                                  key={`${isFollowUp ? 'f' : 's'}-${prompt}`}
                                  type="button"
                                  onClick={() => void submitAgentQuestion(prompt)}
                                  disabled={isAgentThinking}
                                  initial={{ opacity: 0, y: 6 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: index * 0.04, duration: 0.18 }}
                                  className="group inline-flex max-w-full items-center gap-1.5 rounded-full border border-surface-200 bg-surface-50 px-3 py-2 text-left text-xs font-bold text-surface-600 transition hover:border-surface-900 hover:bg-white hover:text-surface-900 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  <span className="truncate [overflow-wrap:anywhere]">{prompt}</span>
                                  {isFollowUp && (
                                    <svg
                                      className="h-3 w-3 shrink-0 text-surface-300 transition-all group-hover:translate-x-0.5 group-hover:text-surface-900"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                      strokeWidth={2.5}
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                                      />
                                    </svg>
                                  )}
                                </motion.button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                  <form onSubmit={handleSendAgentMessage} className="flex min-w-0 gap-2.5">
                    <input
                      type="text"
                      value={agentInput}
                      onChange={e => setAgentInput(e.target.value)}
                      placeholder="블로그·피드·Vault·Info에 대해 물어보기..."
                      autoComplete="off"
                      className="min-w-0 flex-1 rounded-xl border border-surface-200 bg-surface-50 px-4 py-3 text-sm font-medium text-surface-900 placeholder:text-surface-400 transition-all focus:border-surface-900 focus:outline-none focus:ring-1 focus:ring-surface-900"
                    />
                    <button
                      type="submit"
                      disabled={!agentInput.trim() || isAgentThinking}
                      className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-surface-900 text-white transition-all hover:bg-surface-800 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                        />
                      </svg>
                    </button>
                  </form>
                </div>
              </>
            ) : !user ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-surface-50 p-6">
                <div className="text-center">
                  <p className="text-sm font-bold text-surface-900">
                    주인에게 메시지를 남기려면 로그인이 필요해요
                  </p>
                  <p className="mt-1 text-xs leading-5 text-surface-400">
                    로그인 없이 궁금한 내용은 Agent에게 바로 물어볼 수 있습니다.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setMode('agent')}
                    className="rounded-xl border border-surface-200 bg-white px-4 py-2.5 text-sm font-semibold text-surface-700 transition hover:border-surface-900 hover:text-surface-900"
                  >
                    Agent로 묻기
                  </button>
                  <Link
                    href="/login"
                    onClick={onClose}
                    className="rounded-xl bg-surface-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-surface-800"
                  >
                    로그인
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <ChatMessageList messages={messages} currentUsername={username} />
                <ChatComposer
                  value={inputMessage}
                  placeholder={
                    isConnected ? '메시지를 입력하세요...' : '네트워크가 불안정해도 전송됩니다'
                  }
                  disabled={!inputMessage.trim()}
                  onChange={setInputMessage}
                  onSubmit={handleSendMessage}
                />
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function AgentMessageList({
  messages,
  isThinking,
}: {
  messages: AgentMessage[];
  isThinking: boolean;
}) {
  return (
    <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain bg-surface-50 p-3 custom-scrollbar sm:p-4">
      {messages.map(message => (
        <div
          key={message.id}
          className={`min-w-0 rounded-2xl p-3 text-sm leading-7 shadow-sm sm:p-4 ${
            message.role === 'user'
              ? 'ml-8 bg-surface-900 text-white'
              : 'mr-0 border border-surface-200 bg-white text-surface-700 sm:mr-4'
          }`}
        >
          <p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{message.content}</p>
          {message.stages && message.role === 'assistant' && (
            <div className="mt-3 space-y-1.5">
              {message.stages.slice(0, 5).map(stage => (
                <div
                  key={stage.name}
                  className="rounded-xl bg-surface-50 px-3 py-2 text-xs leading-5 text-surface-600"
                >
                  <span className="font-black text-cyan-600">{stage.name}</span>
                  <span className="mx-2 text-surface-300">·</span>
                  {stage.detail}
                </div>
              ))}
            </div>
          )}
          {message.sources && message.sources.length > 0 && (
            <div className="mt-3 border-t border-surface-200 pt-3">
              <p className="mb-2 font-mono text-[10px] font-black uppercase tracking-[0.2em] text-surface-400">
                Sources
              </p>
              <div className="grid gap-2">
                {message.sources.slice(0, 5).map(source => (
                  <Link
                    key={`${source.type}-${source.id}`}
                    href={sourceHref(source)}
                    className="flex min-w-0 items-center justify-between gap-2 rounded-xl border border-surface-200 bg-surface-50 px-3 py-2 text-xs font-bold text-surface-600 transition hover:border-surface-900 hover:bg-white hover:text-surface-900"
                  >
                    <span className="min-w-0 truncate [overflow-wrap:anywhere]">
                      <span className="mr-2 font-mono text-[9px] uppercase tracking-[0.14em] text-surface-400">
                        {source.type || 'vault'}
                      </span>
                      {source.title || source.slug}
                    </span>
                    <span className="shrink-0 text-surface-400">열기</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
      {isThinking && (
        <div className="mr-4 rounded-2xl border border-surface-200 bg-white p-4 text-sm font-bold text-surface-500 shadow-sm">
          공개 콘텐츠를 찾아보고 있어요…
        </div>
      )}
    </div>
  );
}
