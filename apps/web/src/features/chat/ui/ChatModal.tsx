'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/entities/user/model/authStore';
import { useChatSocket } from '@/features/chat/lib/useChatSocket';
import ChatMessageList from '@/features/chat/ui/ChatMessageList';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatModal({ isOpen, onClose }: ChatModalProps) {
  const { user } = useAuthStore();
  const [inputMessage, setInputMessage] = useState('');

  const username = user?.displayName || user?.username || '익명';
  const { messages, isConnected, onlineUsers, sendMessage } = useChatSocket({
    isOpen,
    username,
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputMessage);
    setInputMessage('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1300]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          <motion.div
            className="fixed bottom-24 right-6 z-[1400] w-[400px] h-[600px] bg-white border border-surface-200 rounded-[24px] shadow-2xl overflow-hidden flex flex-col"
            initial={{ opacity: 0, scale: 0.8, y: 100, x: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 100, x: 50 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 border-b border-surface-200 bg-surface-50 flex-shrink-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-surface-900 rounded-full flex items-center justify-center shadow-sm">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-surface-900">실시간 채팅</h3>
                    <p className="text-xs text-surface-500 font-medium">
                      {isConnected ? '연결됨' : '연결 중...'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-200 text-surface-400 hover:text-surface-900 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-surface-200 shadow-sm">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                  <span className="text-xs font-bold tracking-wide text-surface-600">
                    {onlineUsers} 명 접속
                  </span>
                </div>
              </div>
            </div>

            <ChatMessageList messages={messages} currentUsername={username} />

            {/* Input */}
            <div className="p-4 border-t border-surface-200 bg-white flex-shrink-0">
              <form onSubmit={handleSendMessage} className="flex gap-3">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={e => setInputMessage(e.target.value)}
                  placeholder={isConnected ? '메시지 입력...' : '연결 중...'}
                  disabled={!isConnected}
                  className="flex-1 px-4 py-3 rounded-xl bg-surface-50 border border-surface-200 text-surface-900 placeholder:text-surface-400 text-sm focus:outline-none focus:border-surface-900 focus:ring-1 focus:ring-surface-900 disabled:opacity-50 transition-all font-medium shadow-inner"
                />
                <button
                  type="submit"
                  disabled={!isConnected || !inputMessage.trim()}
                  className="w-12 h-12 flex items-center justify-center bg-surface-900 hover:bg-surface-800 rounded-xl text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg hover:-translate-y-0.5"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
