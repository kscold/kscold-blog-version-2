'use client';

import { useState } from 'react';
import FloatingChatButton from './FloatingChatButton';
import ChatModal from './ChatModal';

export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <FloatingChatButton onClick={() => setIsOpen(true)} unreadCount={0} />
      <ChatModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
