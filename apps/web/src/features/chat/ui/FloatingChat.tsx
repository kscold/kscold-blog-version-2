'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useMedia } from 'react-use';
import FloatingChatButton from './FloatingChatButton';
import ChatModal from './ChatModal';

export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isVaultPage = pathname.startsWith('/vault');
  // 데스크톱(lg+)에서는 홈과 동일한 기본 위치. 모바일 Vault에서만 폴더 FAB·줌 컨트롤과
  // 겹치지 않도록 위로 올린다.
  const isDesktop = useMedia('(min-width: 1024px)', false);

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
        bottomOffset={
          isVaultPage && !isDesktop
            ? 'calc(env(safe-area-inset-bottom, 0px) + 5.75rem)'
            : undefined
        }
      />
      <ChatModal isOpen={isOpen} isElevated={isVaultPage} onClose={handleClose} />
    </>
  );
}
