'use client';

import { useAuthStore } from '@/entities/user/model/authStore';
import FloatingChat from '@/features/chat/ui/FloatingChat';

export function FloatingChatWidget() {
  const { user } = useAuthStore();

  // 어드민은 자기 자신에게 채팅할 수 없으므로 플로팅 버튼 숨김
  if (user?.role === 'ADMIN') return null;

  return <FloatingChat />;
}
