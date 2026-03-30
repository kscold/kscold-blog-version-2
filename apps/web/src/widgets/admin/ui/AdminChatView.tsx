'use client';

import { useMemo, useState } from 'react';
import { useChatAdmin } from '@/features/chat/lib/useChatAdmin';
import { AdminChatComposer } from './chat/AdminChatComposer';
import { AdminChatConversation } from './chat/AdminChatConversation';
import { AdminChatRoomList } from './chat/AdminChatRoomList';

export default function AdminChatView() {
  const { rooms, isConnected, selectedRoomId, selectRoom, clearSelectedRoom, sendMessage } = useChatAdmin();
  const [input, setInput] = useState('');

  const roomList = useMemo(
    () =>
      Array.from(rooms.values()).sort((a, b) => {
        if (a.online !== b.online) return a.online ? -1 : 1;
        return (b.lastTimestamp || '').localeCompare(a.lastTimestamp || '');
      }),
    [rooms]
  );
  const selectedRoom = selectedRoomId ? rooms.get(selectedRoomId) ?? null : null;

  const handleSend = () => {
    if (!selectedRoomId || !input.trim()) return;
    sendMessage(input.trim(), selectedRoomId);
    setInput('');
  };

  return (
    <div className="flex h-[calc(100dvh-8rem)] min-h-[32rem] flex-col overflow-hidden rounded-2xl border border-surface-200 bg-white lg:flex-row">
      <AdminChatRoomList
        rooms={roomList}
        selectedRoomId={selectedRoomId}
        onSelect={selectRoom}
        hiddenOnMobile={Boolean(selectedRoom)}
      />
      <div className={`${selectedRoom ? 'flex' : 'hidden lg:flex'} min-h-0 min-w-0 flex-1 flex-col`}>
        <div className="flex items-center gap-2 border-b border-surface-200 px-4 py-2 text-xs text-surface-400">
          <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-surface-300'}`} />
          {isConnected ? '실시간 연결됨' : 'REST fallback 대기 중'}
        </div>
        <AdminChatConversation room={selectedRoom} onBack={clearSelectedRoom} />
        {selectedRoom && (
          <AdminChatComposer
            value={input}
            onChange={setInput}
            onSend={handleSend}
            disabled={!input.trim()}
          />
        )}
      </div>
    </div>
  );
}
