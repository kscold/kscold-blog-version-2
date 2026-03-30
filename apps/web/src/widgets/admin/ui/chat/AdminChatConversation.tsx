'use client';

import type { AdminRoom } from '@/entities/chat';

interface Props {
  room: AdminRoom | null;
  onBack: () => void;
}

export function AdminChatConversation({ room, onBack }: Props) {
  if (!room) {
    return (
      <div className="hidden flex-1 items-center justify-center text-sm text-surface-400 lg:flex">
        방문자를 선택하세요
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col min-w-0">
      <div className="flex items-center gap-2 border-b border-surface-200 px-4 py-3">
        <button onClick={onBack} className="rounded-lg p-2 text-surface-500 hover:bg-surface-100 lg:hidden">
          뒤로
        </button>
        <span className={`h-2 w-2 rounded-full ${room.online ? 'bg-green-400' : 'bg-surface-300'}`} />
        <span className="truncate text-sm font-semibold text-surface-900">{room.username}</span>
        {!room.online && <span className="text-xs text-surface-400">(오프라인)</span>}
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {room.messages.length === 0 && <p className="text-center text-xs text-surface-400">아직 메시지가 없습니다.</p>}
        {room.messages.map(message => (
          <div key={message.id} className={message.type === 'system' ? 'text-center' : `flex ${message.fromAdmin ? 'justify-end' : 'justify-start'}`}>
            {message.type === 'system' ? (
              <span className="rounded-full bg-surface-50 px-3 py-1 text-xs text-surface-400">{message.content}</span>
            ) : (
              <div className={`max-w-[82%] rounded-2xl px-3 py-2 text-sm ${message.fromAdmin ? 'rounded-br-sm bg-surface-900 text-white' : 'rounded-bl-sm bg-surface-100 text-surface-900'}`}>
                <p>{message.content}</p>
                <p className={`mt-1 text-[10px] ${message.fromAdmin ? 'text-right text-surface-300' : 'text-surface-400'}`}>
                  {new Date(message.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
