'use client';

import { useState } from 'react';
import {
  useMessageDeliveries,
  useMessageDeliveryStatus,
  type MessageDeliveryChannel,
  type MessageDeliveryStatusCode,
} from '@/features/message-delivery';
import { Pagination } from '@/shared/ui/Pagination';

const CHANNEL_LABEL: Record<MessageDeliveryChannel, string> = {
  ALIMTALK: '알림톡',
  EMAIL: '이메일',
};

const PURPOSE_LABEL: Record<string, string> = {
  STACK_SHARE_SETTLEMENT: '공동 구독 정산',
  ACCESS_REQUEST_APPROVED: '열람 승인',
  MAIL: '안내 메일',
};

const formatDateTime = (value?: string) =>
  value ? new Date(value).toLocaleString('ko-KR', { dateStyle: 'short', timeStyle: 'medium' }) : '-';

/**
 * 알림톡·이메일이 실제로 나갔는지 확인하는 화면.
 *
 * 우리 기록은 "발송 요청까지 성공"만 알고 있어서, 알림톡은 공급자에게 다시 물어봐야
 * 단말에 닿았는지와 실패 사유를 알 수 있다. 그 조회를 행마다 펼쳐볼 수 있게 했다.
 */
export function MessageDeliveryContainer() {
  const [channel, setChannel] = useState<MessageDeliveryChannel | ''>('');
  const [status, setStatus] = useState<MessageDeliveryStatusCode | ''>('');
  const [page, setPage] = useState(0);
  const [openGroupId, setOpenGroupId] = useState<string | null>(null);

  const deliveries = useMessageDeliveries({
    channel: channel || undefined,
    status: status || undefined,
    page,
  });
  const providerStatus = useMessageDeliveryStatus(openGroupId);

  const logs = deliveries.data?.content ?? [];
  const totalPages = deliveries.data?.totalPages ?? 0;

  const changeFilter = (next: () => void) => {
    next();
    setPage(0);
    setOpenGroupId(null);
  };

  return (
    <section className="rounded-3xl border border-surface-200 bg-white p-6 sm:p-8">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-surface-400">
            Delivery log
          </p>
          <h2 className="mt-3 text-2xl font-black text-surface-900">발송 로그</h2>
          <p className="mt-2 text-sm text-surface-500">
            누구에게 무엇이 나갔는지 남깁니다. 알림톡은 &apos;도달 확인&apos;을 누르면 실제로
            받았는지와 실패 사유까지 조회합니다.
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={channel}
            onChange={event =>
              changeFilter(() => setChannel(event.target.value as MessageDeliveryChannel | ''))
            }
            className="rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm"
          >
            <option value="">전체 채널</option>
            <option value="ALIMTALK">알림톡</option>
            <option value="EMAIL">이메일</option>
          </select>
          <select
            value={status}
            onChange={event =>
              changeFilter(() => setStatus(event.target.value as MessageDeliveryStatusCode | ''))
            }
            className="rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm"
          >
            <option value="">전체 상태</option>
            <option value="SENT">발송됨</option>
            <option value="FAILED">발송 실패</option>
          </select>
        </div>
      </header>

      <div className="mt-6 space-y-2">
        {deliveries.isLoading && <p className="text-sm text-surface-400">불러오는 중...</p>}
        {!deliveries.isLoading && logs.length === 0 && (
          <p className="py-8 text-center text-sm text-surface-400">아직 발송 기록이 없습니다.</p>
        )}

        {logs.map(log => {
          const isOpen = Boolean(log.providerGroupId) && openGroupId === log.providerGroupId;
          return (
            <article key={log.id} className="rounded-2xl border border-surface-200 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-surface-100 px-2 py-0.5 text-[10px] font-bold text-surface-600">
                      {CHANNEL_LABEL[log.channel]}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        log.status === 'SENT'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {log.status === 'SENT' ? '발송됨' : '발송 실패'}
                    </span>
                    <span className="text-xs text-surface-400">
                      {PURPOSE_LABEL[log.purpose] ?? log.purpose}
                    </span>
                  </div>
                  <p className="mt-2 font-bold text-surface-900">
                    {log.recipientName ? `${log.recipientName} · ` : ''}
                    {log.recipient}
                  </p>
                  {log.summary && <p className="mt-1 text-sm text-surface-500">{log.summary}</p>}
                  {log.failureReason && (
                    <p className="mt-1 text-sm text-red-600">사유: {log.failureReason}</p>
                  )}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <span className="font-mono text-xs text-surface-400">
                    {formatDateTime(log.createdAt)}
                  </span>
                  {log.providerGroupId && (
                    <button
                      type="button"
                      onClick={() => setOpenGroupId(isOpen ? null : log.providerGroupId!)}
                      className="rounded-lg border border-surface-200 px-3 py-1.5 text-xs font-semibold text-surface-600 transition hover:border-surface-900 hover:text-surface-900"
                    >
                      {isOpen ? '접기' : '도달 확인'}
                    </button>
                  )}
                </div>
              </div>

              {isOpen && (
                <div className="mt-4 border-t border-surface-100 pt-4">
                  {providerStatus.isLoading && (
                    <p className="text-sm text-surface-400">공급자에게 확인 중...</p>
                  )}
                  {providerStatus.isError && (
                    <p className="text-sm text-red-600">도달 상태를 불러오지 못했습니다.</p>
                  )}
                  {providerStatus.data?.length === 0 && (
                    <p className="text-sm text-surface-400">
                      공급자에 조회 결과가 없습니다. API 키 설정을 확인해주세요.
                    </p>
                  )}
                  {providerStatus.data
                    ?.filter(item => item.recipient === log.recipient)
                    .map(item => (
                      <div key={item.messageId} className="space-y-2 text-sm">
                        <p>
                          <strong
                            className={item.delivered ? 'text-emerald-700' : 'text-amber-700'}
                          >
                            {item.delivered ? '수신 완료' : `미도달 (${item.status})`}
                          </strong>
                          <span className="ml-2 font-mono text-xs text-surface-400">
                            statusCode {item.statusCode}
                          </span>
                        </p>
                        <p className="text-xs text-surface-500">
                          발송 {formatDateTime(item.sentAt)} · 수신 {formatDateTime(item.receivedAt)}
                        </p>
                        {item.text && (
                          <pre className="overflow-x-auto whitespace-pre-wrap rounded-xl bg-surface-50 p-3 text-xs text-surface-700">
                            {item.text}
                          </pre>
                        )}
                        {item.logs.length > 0 && (
                          <ul className="space-y-0.5 text-xs text-surface-400">
                            {item.logs.map((line, index) => (
                              <li key={index}>{line}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </article>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </section>
  );
}
