'use client';

import { useState, useRef, useEffect } from 'react';
import { useChatAdmin } from '@/features/chat/lib/useChatAdmin';

export default function AdminChatView() {
  const { rooms, isConnected, selectedRoomId, selectRoom, sendMessage } = useChatAdmin();
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const roomList = Array.from(rooms.values()).sort((a, b) => {
    if (a.online !== b.online) return a.online ? -1 : 1;
    return a.username.localeCompare(b.username);
  });

  const selectedRoom = selectedRoomId ? rooms.get(selectedRoomId) ?? null : null;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedRoom?.messages.length]);

  const handleSend = () => {
    if (!selectedRoomId || !input.trim()) return;
    sendMessage(input.trim(), selectedRoomId);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-[calc(100vh-10rem)] overflow-hidden rounded-xl border border-surface-200 bg-white">
      {/* 왼쪽: 방문자 목록 */}
      <div className="w-64 shrink-0 border-r border-surface-200 flex flex-col">
        <div className="px-4 py-3 border-b border-surface-200 flex items-center gap-2">
          <span className="text-sm font-semibold text-surface-900">방문자 채팅</span>
          <span
            className={`ml-auto w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-surface-300'}`}
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          {roomList.length === 0 ? (
            <p className="p-4 text-xs text-surface-400 text-center">접속 중인 방문자 없음</p>
          ) : (
            roomList.map(room => (
              <button
                key={room.userId}
                onClick={() => selectRoom(room.userId)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-50 ${
                  selectedRoomId === room.userId ? 'bg-surface-100' : ''
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${room.online ? 'bg-green-400' : 'bg-surface-300'}`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-surface-900 truncate">{room.username}</p>
                  {(room.lastMessage || room.messages.length > 0) && (
                    <p className="text-xs text-surface-400 truncate">
                      {room.lastMessage || room.messages[room.messages.length - 1]?.content}
                    </p>
                  )}
                </div>
                {room.unreadCount > 0 && (
                  <span className="shrink-0 min-w-[1.25rem] h-5 px-1 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">
                    {room.unreadCount}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* 오른쪽: 채팅 창 */}
      <div className="flex-1 flex flex-col min-w-0">
        {!selectedRoom ? (
          <div className="flex-1 flex items-center justify-center text-surface-400 text-sm">
            방문자를 선택하세요
          </div>
        ) : (
          <>
            {/* 헤더 */}
            <div className="px-4 py-3 border-b border-surface-200 flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${selectedRoom.online ? 'bg-green-400' : 'bg-surface-300'}`}
              />
              <span className="text-sm font-semibold text-surface-900">{selectedRoom.username}</span>
              {!selectedRoom.online && (
                <span className="text-xs text-surface-400">(오프라인)</span>
              )}
            </div>

            {/* 메시지 목록 */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {selectedRoom.messages.length === 0 && (
                <p className="text-center text-xs text-surface-400">아직 메시지가 없습니다.</p>
              )}
              {selectedRoom.messages.map(msg => {
                if (msg.type === 'system') {
                  return (
                    <div key={msg.id} className="text-center">
                      <span className="text-xs text-surface-400 bg-surface-50 px-3 py-1 rounded-full">
                        {msg.content}
                      </span>
                    </div>
                  );
                }
                const isMyMessage = msg.fromAdmin;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] px-3 py-2 rounded-2xl text-sm ${
                        isMyMessage
                          ? 'bg-surface-900 text-white rounded-br-sm'
                          : 'bg-surface-100 text-surface-900 rounded-bl-sm'
                      }`}
                    >
                      <p>{msg.content}</p>
                      <p
                        className={`text-[10px] mt-1 ${isMyMessage ? 'text-surface-300 text-right' : 'text-surface-400'}`}
                      >
                        {new Date(msg.timestamp).toLocaleTimeString('ko-KR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* 입력창 */}
            <div className="px-4 py-3 border-t border-surface-200 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={selectedRoom.online ? '메시지 입력...' : '오프라인 방문자에게는 보낼 수 없습니다'}
                disabled={!selectedRoom.online}
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-surface-200 focus:outline-none focus:ring-2 focus:ring-surface-300 disabled:bg-surface-50 disabled:text-surface-400"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || !selectedRoom.online}
                className="px-4 py-2 bg-surface-900 text-white text-sm rounded-lg hover:bg-surface-800 disabled:opacity-40 transition-colors"
              >
                전송
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
