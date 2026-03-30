'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/entities/user/model/authStore';
import { useChatSocket } from '@/features/chat/lib/useChatSocket';
import ChatMessageList from '@/features/chat/ui/ChatMessageList';
import { ChatComposer } from './ChatComposer';
import { ChatLoginGate } from './ChatLoginGate';
import { ChatModalHeader } from './ChatModalHeader';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatModal({ isOpen, onClose }: ChatModalProps) {
  const { user } = useAuthStore();
  const [inputMessage, setInputMessage] = useState('');

  const username = user?.displayName || user?.username || '';
  const { messages, isConnected, sendMessage } = useChatSocket({
    isOpen: isOpen && !!user,
    username,
  });

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    await sendMessage(inputMessage);
    setInputMessage('');
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
            <ChatModalHeader isConnected={isConnected} onClose={onClose} />

            {/* 본문 */}
            {!user ? (
              <ChatLoginGate onClose={onClose} />
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
