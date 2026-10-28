'use client';

import type { CSSProperties } from 'react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuthStore } from '@/entities/user';
import { usePerformanceMode } from '@/shared/model/usePerformanceMode';
import { useChatSocket } from '@/features/chat';
import { useAgentChat } from '../model/useAgentChat';
import { useChatDialog } from '../model/useChatDialog';
import { useChatViewport } from '../model/useChatViewport';
import { useChatResize } from '../model/useChatResize';
import { ChatResizeHandles } from './ChatResizeHandles';
import { ChatNotice } from './ChatNotice';
import ChatMessageList from './ChatMessageList';
import { ChatComposer } from './ChatComposer';
import { ChatModalHeader } from './ChatModalHeader';
import { AgentMessageList } from './AgentMessageList';
import { AgentSuggestions } from './AgentSuggestions';
import { AgentComposer } from './AgentComposer';
import { ChatAccessGate } from './ChatAccessGate';
import { ChatModeTabs, type ChatMode } from './ChatModeTabs';

interface ChatModalProps {
  isOpen: boolean;
  isElevated?: boolean;
  onClose: () => void;
  initialQuestion?: string;
}

export default function ChatModal({ isOpen, isElevated = false, onClose, initialQuestion }: ChatModalProps) {
  const { user } = useAuthStore();
  const { allowRichEffects } = usePerformanceMode();
  const panelRef = useChatDialog(isOpen, onClose);
  useChatViewport(isOpen, panelRef);
  const resize = useChatResize(isOpen, panelRef);
  const [inputMessage, setInputMessage] = useState('');
  const [mode, setMode] = useState<ChatMode>('agent');
  const [draftViewer, setDraftViewer] = useState(user?.id);
  const hasCurrentDraft = draftViewer === user?.id;
  const {
    agentMessages,
    agentContentScope,
    isAgentThinking,
    isAgentHistoryLoading,
    agentHistoryError,
    retryHistory,
    agentInput,
    setAgentInput,
    submitAgentQuestion,
    suggestions,
    isFollowUp,
    isSuggestionsOpen,
    setIsSuggestionsOpen,
    startNewChat,
    canStartNewChat,
    cancelAgentResponse,
    retryLastQuestion,
    canRetryLastQuestion,
  } = useAgentChat(isOpen);

  const question = isOpen ? initialQuestion : undefined;
  const [preparedQuestion, setPreparedQuestion] = useState<string | undefined>(undefined);
  if (preparedQuestion !== question) {
    setPreparedQuestion(question);
    if (question) {
      setMode('agent');
      setAgentInput(question);
      setIsSuggestionsOpen(false);
    }
  }


  const username = user?.displayName || user?.username || '';
  const ownerChat = useChatSocket({
    isOpen: isOpen && !!user && mode === 'owner',
    viewerId: user?.id || '',
  });
  const { messages, isConnected, sendMessage } = ownerChat;
  const modalPositionStyle = {
    ...resize.style,
    '--chat-modal-bottom': isElevated
      ? 'calc(env(safe-area-inset-bottom, 0px) + 7.75rem)'
      : 'calc(env(safe-area-inset-bottom, 0px) + 2rem)',
    '--chat-modal-max-height': isElevated
      ? 'calc(100dvh - env(safe-area-inset-bottom, 0px) - 9.25rem)'
      : 'calc(100dvh - env(safe-area-inset-bottom, 0px) - 2.5rem)',
  } as CSSProperties;

  if (!hasCurrentDraft) {
    setDraftViewer(user?.id);
    setInputMessage('');
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    const submitted = inputMessage;
    if (await sendMessage(submitted)) {
      setInputMessage(current => current === submitted ? '' : current);
    }
  };

  const handleSendAgentMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    void submitAgentQuestion(agentInput);
  };

  const title = mode === 'agent' ? 'KSCOLD Agent와 대화' : '블로그 주인과 대화';
  const subtitle = mode === 'agent' ? agentContentScope?.label || '기록을 찾아 답합니다' : undefined;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 오버레이 */}
          <motion.div
            className={`fixed inset-0 z-1300 transition-colors ${
              resize.isMaximized ? 'bg-black/20' : 'bg-black/60 backdrop-blur-sm'
            }`}
            initial={allowRichEffects ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: allowRichEffects ? 0.2 : 0 }}
            onClick={onClose}
          />

          {/* 모달: 모바일 전체화면 / 데스크탑 우하단 고정 */}
          <motion.div
            ref={panelRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="fixed z-1400 flex min-h-0 flex-col overflow-hidden border border-surface-200 bg-white shadow-2xl
                       inset-x-2 bottom-[calc(var(--chat-keyboard-inset,0px)+0.5rem)] h-[calc(var(--chat-visible-height,100dvh)-0.5rem)] max-h-[calc(var(--chat-visible-height,100dvh)-0.5rem)] rounded-[24px]
                       sm:inset-x-auto sm:bottom-(--chat-modal-bottom) sm:right-4 sm:h-[var(--chat-height,720px)] sm:max-h-(--chat-modal-max-height) sm:w-[var(--chat-width,440px)] sm:min-w-[360px] sm:max-w-[calc(100vw-2rem)] sm:rounded-[24px] focus:outline-hidden"
            style={modalPositionStyle}
            initial={allowRichEffects ? { opacity: 0, y: 80 } : false}
            animate={{ opacity: 1, y: 0 }}
            exit={allowRichEffects ? { opacity: 0, y: 80 } : { opacity: 0 }}
            transition={allowRichEffects ? { type: 'spring', stiffness: 400, damping: 30 } : { duration: 0 }}
            onClick={e => e.stopPropagation()}
          >
            <ChatResizeHandles resize={resize} />
            <ChatModalHeader
              isConnected={mode !== 'owner' || isConnected}
              title={title}
              subtitle={subtitle}
              onClose={onClose}
              onNewChat={mode === 'agent' ? startNewChat : undefined}
              canNewChat={canStartNewChat && !isAgentThinking}
              onResetSize={resize.reset}
              canResetSize={resize.isCustomSize}
              isMaximized={resize.isMaximized}
              onToggleMaximize={resize.toggleMaximize}
            />

            <ChatModeTabs mode={mode} onChange={setMode} />

            {/* 본문 */}
            {mode === 'agent' ? (
              <>
                <AgentMessageList messages={agentMessages} />
                {agentHistoryError && <ChatNotice message={agentHistoryError} onRetry={retryHistory} />}
                <div className="max-h-[60%] shrink-0 overflow-y-auto border-t border-surface-200 bg-white p-3 sm:p-4">
                  <AgentSuggestions
                    suggestions={suggestions}
                    isFollowUp={isFollowUp}
                    isOpen={isSuggestionsOpen}
                    onToggle={() => setIsSuggestionsOpen(open => !open)}
                    onPick={prompt => void submitAgentQuestion(prompt)}
                    disabled={isAgentThinking || isAgentHistoryLoading || !!agentHistoryError}
                  />
                  <AgentComposer
                    value={agentInput}
                    isThinking={isAgentThinking}
                    onStop={cancelAgentResponse}
                    onRetry={() => void retryLastQuestion()}
                    canRetry={canRetryLastQuestion}
                    disabled={
                      !agentInput.trim() || isAgentThinking || isAgentHistoryLoading || !!agentHistoryError
                    }
                    isLoadingHistory={isAgentHistoryLoading}
                    onChange={setAgentInput}
                    onSubmit={handleSendAgentMessage}
                  />
                </div>
              </>
            ) : !user ? (
              <ChatAccessGate
                onAgentClick={() => setMode('agent')}
                onClose={onClose}
              />
            ) : (
              <>
                <ChatMessageList messages={messages} currentUsername={username} />
                {ownerChat.isLoading && <ChatNotice message="이전 메시지를 불러오고 있어요." />}
                {ownerChat.historyError && <ChatNotice message={ownerChat.historyError} onRetry={ownerChat.retryHistory} />}
                {ownerChat.sendError && <ChatNotice message={ownerChat.sendError} />}
                <ChatComposer
                  value={hasCurrentDraft ? inputMessage : ''}
                  placeholder={
                    ownerChat.isSending ? '전송을 확인하고 있어요...' : '블로그 주인에게 메시지 남기기...'
                  }
                  disabled={!inputMessage.trim() || ownerChat.isSending || ownerChat.isLoading}
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
