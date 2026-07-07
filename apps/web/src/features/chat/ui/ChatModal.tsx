'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/entities/user/model/authStore';
import { sendVaultAgentMessage, type VaultAgentSource, type VaultAgentStage } from '@/features/vault/api/vaultAgentApi';
import { useChatSocket } from '@/features/chat/lib/useChatSocket';
import ChatMessageList from '@/features/chat/ui/ChatMessageList';
import { ChatComposer } from './ChatComposer';
import { ChatModalHeader } from './ChatModalHeader';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ChatMode = 'agent' | 'owner';

interface AgentMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  stages?: VaultAgentStage[];
  sources?: VaultAgentSource[];
}

const starterPrompts = [
  '최근 블로그에서 AI Agent 관련 내용 요약해줘',
  'JavaScript async await 노트 설명해줘',
  'Vault에서 먼저 보면 좋은 노트 알려줘',
];

const sourceHref = (source: VaultAgentSource) => {
  const path = source.path || `/vault/${encodeURIComponent(source.slug)}`;
  return `${path}${path.includes('?') ? '&' : '?'}chat=open`;
};

export default function ChatModal({ isOpen, onClose }: ChatModalProps) {
  const { user } = useAuthStore();
  const [inputMessage, setInputMessage] = useState('');
  const [agentInput, setAgentInput] = useState('');
  const [mode, setMode] = useState<ChatMode>('agent');
  const [isAgentThinking, setIsAgentThinking] = useState(false);
  const [agentMessages, setAgentMessages] = useState<AgentMessage[]>([
    {
      id: 1,
      role: 'assistant',
      content:
        '안녕하세요. 승찬님이 공개해둔 블로그 글, 피드, Vault 노트를 찾아 답하는 KSCOLD Agent예요. 비로그인 상태에서는 공개된 콘텐츠만 근거로 사용합니다.',
      stages: [
        { name: '검색', detail: '공개 콘텐츠에서 질문과 가까운 근거를 찾습니다.' },
        { name: '연결', detail: 'Vault 링크와 백링크로 주변 맥락을 넓힙니다.' },
        { name: '정리', detail: '답변과 함께 바로 열 수 있는 출처를 남깁니다.' },
      ],
    },
  ]);

  const username = user?.displayName || user?.username || '';
  const { messages, isConnected, sendMessage } = useChatSocket({
    isOpen: isOpen && !!user && mode === 'owner',
    username,
  });

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    await sendMessage(inputMessage);
    setInputMessage('');
  };

  const handleSendAgentMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const question = agentInput.trim();
    if (!question || isAgentThinking) return;

    setAgentMessages(prev => [
      ...prev,
      {
        id: Date.now(),
        role: 'user',
        content: question,
      },
    ]);
    setAgentInput('');
    setIsAgentThinking(true);

    try {
      const response = await sendVaultAgentMessage(question, 'KSCOLD 공개 콘텐츠');
      setAgentMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          content: response.answer,
          stages: response.stages,
          sources: response.sources,
        },
      ]);
    } catch {
      setAgentMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
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
            className="fixed z-[1400] bg-white border border-surface-200 shadow-2xl overflow-hidden flex flex-col
                       inset-0 h-[100dvh] rounded-none
                       sm:inset-auto sm:bottom-24 sm:right-6 sm:w-[400px] sm:h-[600px] sm:rounded-[24px]"
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

            <div className="grid grid-cols-2 gap-2 border-b border-surface-200 bg-white px-4 py-3">
              <button
                type="button"
                onClick={() => setMode('agent')}
                className={`rounded-xl px-3 py-2 text-xs font-black transition ${
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
                className={`rounded-xl px-3 py-2 text-xs font-black transition ${
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
                <div className="border-t border-surface-200 bg-white p-4">
                  <div className="mb-3 flex flex-wrap gap-2">
                    {starterPrompts.map(prompt => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => setAgentInput(prompt)}
                        className="rounded-full border border-surface-200 bg-surface-50 px-3 py-2 text-xs font-bold text-surface-600 transition hover:border-surface-900 hover:text-surface-900"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                  <form onSubmit={handleSendAgentMessage} className="flex gap-2.5">
                    <input
                      type="text"
                      value={agentInput}
                      onChange={e => setAgentInput(e.target.value)}
                      placeholder="블로그/Vault에 대해 물어보기..."
                      autoComplete="off"
                      className="flex-1 rounded-xl border border-surface-200 bg-surface-50 px-4 py-3 text-sm font-medium text-surface-900 placeholder:text-surface-400 transition-all focus:border-surface-900 focus:outline-none focus:ring-1 focus:ring-surface-900"
                    />
                    <button
                      type="submit"
                      disabled={!agentInput.trim() || isAgentThinking}
                      className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-surface-900 text-white transition-all hover:bg-surface-800 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </button>
                  </form>
                </div>
              </>
            ) : !user ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-surface-50 p-6">
                <div className="text-center">
                  <p className="text-sm font-bold text-surface-900">주인에게 메시지를 남기려면 로그인이 필요해요</p>
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
                  placeholder={isConnected ? '메시지를 입력하세요...' : '네트워크가 불안정해도 전송됩니다'}
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
    <div className="flex-1 space-y-3 overflow-y-auto bg-surface-50 p-4 custom-scrollbar">
      {messages.map(message => (
        <div
          key={message.id}
          className={`rounded-2xl p-4 text-sm leading-7 shadow-sm ${
            message.role === 'user'
              ? 'ml-8 bg-surface-900 text-white'
              : 'mr-4 border border-surface-200 bg-white text-surface-700'
          }`}
        >
          <p className="whitespace-pre-wrap">{message.content}</p>
          {message.stages && message.role === 'assistant' && (
            <div className="mt-3 space-y-1.5">
              {message.stages.slice(0, 3).map(stage => (
                <div key={stage.name} className="rounded-xl bg-surface-50 px-3 py-2 text-xs leading-5 text-surface-600">
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
                    className="flex items-center justify-between gap-2 rounded-xl border border-surface-200 bg-surface-50 px-3 py-2 text-xs font-bold text-surface-600 transition hover:border-surface-900 hover:bg-white hover:text-surface-900"
                  >
                    <span className="min-w-0 truncate">
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
