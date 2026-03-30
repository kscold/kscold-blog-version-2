'use client';

import type { AdminRoom } from '@/entities/chat';

interface Props {
  rooms: AdminRoom[];
  selectedRoomId: string | null;
  onSelect: (roomId: string) => void;
  hiddenOnMobile: boolean;
}

export function AdminChatRoomList({ rooms, selectedRoomId, onSelect, hiddenOnMobile }: Props) {
  return (
    <div className={`${hiddenOnMobile ? 'hidden lg:flex' : 'flex'} w-full shrink-0 flex-col border-b border-surface-200 lg:w-72 lg:border-b-0 lg:border-r`}>
      <div className="flex items-center gap-2 border-b border-surface-200 px-4 py-3">
        <span className="text-sm font-semibold text-surface-900">방문자 채팅</span>
        <span className="text-xs text-surface-400">{rooms.length} rooms</span>
      </div>
      <div className="flex-1 overflow-y-auto">
        {rooms.length === 0 ? (
          <p className="p-4 text-center text-xs text-surface-400">채팅 기록이 없습니다</p>
        ) : (
          rooms.map(room => (
            <button
              key={room.userId}
              onClick={() => onSelect(room.userId)}
              className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-50 ${
                selectedRoomId === room.userId ? 'bg-surface-100' : ''
              }`}
            >
              <span className={`h-2 w-2 shrink-0 rounded-full ${room.online ? 'bg-green-400' : 'bg-surface-300'}`} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-surface-900">{room.username}</p>
                <p className="truncate text-xs text-surface-400">
                  {room.lastMessage || room.messages[room.messages.length - 1]?.content || '메시지 없음'}
                </p>
              </div>
              {room.unreadCount > 0 && (
                <span className="flex h-5 min-w-[1.25rem] shrink-0 items-center justify-center rounded-full bg-blue-500 px-1 text-xs text-white">
                  {room.unreadCount}
                </span>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
