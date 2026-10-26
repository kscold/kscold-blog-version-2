'use client';

import { useEffect, type RefObject } from 'react';

export function useChatViewport(isOpen: boolean, panel: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!isOpen || !viewport) return;
    const update = () => {
      panel.current?.style.setProperty('--chat-visible-height', viewport.height + 'px');
      panel.current?.style.setProperty('--chat-keyboard-inset',
        Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop) + 'px');
    };
    update();
    viewport.addEventListener('resize', update);
    viewport.addEventListener('scroll', update);
    return () => {
      viewport.removeEventListener('resize', update);
      viewport.removeEventListener('scroll', update);
    };
  }, [isOpen, panel]);
}
