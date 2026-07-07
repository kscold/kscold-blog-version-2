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
  const isVaultPage = pathname.startsWith('/vault');

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

  const handleOpen = () => {
    setIsOpen(true);
    if (searchParams.get('chat') === 'open') {
      return;
    }

    const next = new URLSearchParams(searchParams.toString());
    next.set('chat', 'open');
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };

  const handleClose = () => {
    setIsOpen(false);
    clearChatParam();
  };

  return (
    <>
      <FloatingChatButton
        onClick={handleOpen}
        unreadCount={0}
        bottomOffset={isVaultPage ? 'calc(env(safe-area-inset-bottom, 0px) + 5.75rem)' : undefined}
      />
      <ChatModal isOpen={isOpen} isElevated={isVaultPage} onClose={handleClose} />
    </>
  );
}
