'use client';

import { useChatAdmin } from '@/features/chat/lib/useChatAdmin';

export default function AdminChatView() {
  const { messages, page, totalPages, totalElements, isLoading, fetchPage } = useChatAdmin();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-surface-900">채팅 메시지</h2>
          <p className="text-sm text-surface-500">총 {totalElements}개 메시지</p>
        </div>
        <button
          onClick={() => fetchPage(page)}
          disabled={isLoading}
          className="px-4 py-2 bg-surface-900 text-white text-sm rounded-lg hover:bg-surface-800 disabled:opacity-50 transition-colors"
        >
          {isLoading ? '로딩 중...' : '새로고침'}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
        {messages.length === 0 && !isLoading ? (
          <div className="p-8 text-center text-surface-400 text-sm">메시지가 없습니다.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-surface-50 border-b border-surface-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-surface-600 w-32">시간</th>
                <th className="px-4 py-3 text-left font-semibold text-surface-600 w-28">사용자</th>
                <th className="px-4 py-3 text-left font-semibold text-surface-600">내용</th>
                <th className="px-4 py-3 text-left font-semibold text-surface-600 w-20">타입</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {messages.map(msg => (
                <tr key={msg.id} className="hover:bg-surface-50 transition-colors">
                  <td className="px-4 py-3 text-surface-500 font-mono text-xs">
                    {new Date(msg.timestamp).toLocaleString('ko-KR', {
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="px-4 py-3 font-medium text-surface-700">{msg.username}</td>
                  <td className="px-4 py-3 text-surface-800">{msg.content}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                        msg.type === 'SYSTEM'
                          ? 'bg-surface-100 text-surface-500'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {msg.type === 'SYSTEM' ? '시스템' : '메시지'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => fetchPage(page - 1)}
            disabled={page === 0 || isLoading}
            className="px-3 py-1.5 text-sm border border-surface-200 rounded-lg disabled:opacity-40 hover:bg-surface-50 transition-colors"
          >
            이전
          </button>
          <span className="text-sm text-surface-600">
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => fetchPage(page + 1)}
            disabled={page >= totalPages - 1 || isLoading}
            className="px-3 py-1.5 text-sm border border-surface-200 rounded-lg disabled:opacity-40 hover:bg-surface-50 transition-colors"
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}
