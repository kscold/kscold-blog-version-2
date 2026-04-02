'use client';

import FloatingChat from '@/features/chat/ui/FloatingChat';
import { useViewer } from '@/shared/model/useViewer';

export function FloatingChatWidget() {
  const { role } = useViewer();

  // 어드민은 자기 자신에게 채팅할 수 없으므로 플로팅 버튼 숨김
  if (role === 'ADMIN') return null;

  return <FloatingChat />;
}
