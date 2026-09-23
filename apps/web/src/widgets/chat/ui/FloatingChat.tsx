'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import FloatingChatButton from './FloatingChatButton';
import { getAgentEntryQuestion } from '@/features/chat';

const ChatModal = dynamic(() => import('./ChatModal'), { ssr: false });

export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [shouldLoadModal, setShouldLoadModal] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isVaultPage = pathname.startsWith('/vault');
  const initialQuestion = getAgentEntryQuestion(searchParams.get('agentTopic'));

  useEffect(() => {
    const shouldOpen = searchParams.get('chat') === 'open';
    setIsOpen(shouldOpen);
    if (shouldOpen) {
      setShouldLoadModal(true);
    }
  }, [searchParams]);

  const clearChatParam = () => {
    if (searchParams.get('chat') !== 'open') {
      return;
    }

    const next = new URLSearchParams(searchParams.toString());
    next.delete('chat');
    next.delete('agentTopic');
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const handleOpen = useCallback(() => {
    setShouldLoadModal(true);
    setIsOpen(true);
    if (searchParams.get('chat') === 'open') {
      return;
    }

    const next = new URLSearchParams(searchParams.toString());
    next.set('chat', 'open');
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  }, [pathname, router, searchParams]);

  useEffect(() => {
    window.addEventListener('kscold-agent-chat:open', handleOpen);
    return () => window.removeEventListener('kscold-agent-chat:open', handleOpen);
  }, [handleOpen]);

  const handleClose = () => {
    setIsOpen(false);
    clearChatParam();
  };

  return (
    <>
      <div className={isVaultPage ? 'lg:block max-lg:hidden' : undefined}>
        <FloatingChatButton onClick={handleOpen} unreadCount={0} />
      </div>
      {shouldLoadModal && (
        <ChatModal isOpen={isOpen} isElevated={isVaultPage} onClose={handleClose} initialQuestion={initialQuestion} />
      )}
    </>
  );
}
