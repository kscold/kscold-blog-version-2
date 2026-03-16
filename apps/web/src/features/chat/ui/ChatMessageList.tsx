'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Message } from '@/features/chat/lib/useChatSocket';

interface ChatMessageListProps {
  messages: Message[];
  currentUsername?: string;
}

export default function ChatMessageList({ messages, currentUsername }: ChatMessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-surface-50">
      <AnimatePresence initial={false}>
        {messages.map((message, index) => (
          <motion.div
            key={`${message.id}-${index}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={
              message.type === 'SYSTEM'
                ? 'text-center my-4'
                : !message.fromAdmin
                  ? 'flex justify-end'
                  : 'flex justify-start'
            }
          >
            {message.type === 'SYSTEM' ? (
              <div className="inline-block px-4 py-1.5 bg-surface-200/50 rounded-full text-[11px] font-bold tracking-wider text-surface-500">
                {message.content}
              </div>
            ) : (
              <div className="max-w-[85%]">
                <div className="text-[11px] font-bold text-surface-400 mb-1.5 px-1 tracking-wide">
                  {message.user.name}
                </div>
                <div
                  className={`px-4 py-2.5 rounded-[16px] shadow-sm ${
                    !message.fromAdmin
                      ? 'bg-surface-900 text-white rounded-tr-sm'
                      : 'bg-white text-surface-700 rounded-tl-sm border border-surface-200'
                  }`}
                >
                  <p className="text-sm break-words leading-relaxed font-medium">
                    {message.content}
                  </p>
                </div>
                <div className="text-[10px] text-surface-400 mt-1.5 px-1 font-mono tracking-wider">
                  {new Date(message.createdAt).toLocaleTimeString('ko-KR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
      <div ref={messagesEndRef} />
    </div>
  );
}
