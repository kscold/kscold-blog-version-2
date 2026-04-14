'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import FloatingChatButton from './FloatingChatButton';
import ChatModal from './ChatModal';

export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get('chat') === 'open') {
      setIsOpen(true);
    }
  }, [searchParams]);

  const clearChatParam = () => {
    if (searchParams.get('chat') !== 'open') {
      return;
    }

    const next = new URLSearchParams(searchParams.toString());
    next.delete('chat');
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const handleClose = () => {
    setIsOpen(false);
    clearChatParam();
  };

  return (
    <>
      <FloatingChatButton onClick={() => setIsOpen(true)} unreadCount={0} />
      <ChatModal isOpen={isOpen} onClose={handleClose} />
    </>
  );
}
