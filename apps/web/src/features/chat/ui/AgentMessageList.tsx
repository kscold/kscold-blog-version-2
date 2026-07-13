'use client';

import Link from 'next/link';
import { sourceHref, type AgentMessage } from '@/features/chat/lib/agentConstants';

export function AgentMessageList({
  messages,
  isThinking,
}: {
  messages: AgentMessage[];
  isThinking: boolean;
}) {
  return (
    <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain bg-surface-50 p-3 custom-scrollbar sm:p-4">
      {messages.map(message => (
        <div
          key={message.id}
          className={`min-w-0 rounded-2xl p-3 text-sm leading-7 shadow-sm sm:p-4 ${
            message.role === 'user'
              ? 'ml-8 bg-surface-900 text-white'
              : 'mr-0 border border-surface-200 bg-white text-surface-700 sm:mr-4'
          }`}
        >
          <p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{message.content}</p>
          {message.stages && message.role === 'assistant' && (
            <div className="mt-3 space-y-1.5">
              {message.stages.slice(0, 5).map(stage => (
                <div
                  key={stage.name}
                  className="rounded-xl bg-surface-50 px-3 py-2 text-xs leading-5 text-surface-600"
                >
                  <span className="font-black text-cyan-600">{stage.name}</span>
                  <span className="mx-2 text-surface-300">·</span>
                  {stage.detail}
                </div>
              ))}
            </div>
          )}
          {message.sources && message.sources.length > 0 && (
            <div className="mt-3 border-t border-surface-200 pt-3">
              <p className="mb-2 font-mono text-[10px] font-black uppercase tracking-[0.2em] text-surface-400">
                Sources
              </p>
              <div className="grid gap-2">
                {message.sources.slice(0, 5).map(source => (
                  <Link
                    key={`${source.type}-${source.id}`}
                    href={sourceHref(source)}
                    className="flex min-w-0 items-center justify-between gap-2 rounded-xl border border-surface-200 bg-surface-50 px-3 py-2 text-xs font-bold text-surface-600 transition hover:border-surface-900 hover:bg-white hover:text-surface-900"
                  >
                    <span className="min-w-0 truncate [overflow-wrap:anywhere]">
                      <span className="mr-2 font-mono text-[9px] uppercase tracking-[0.14em] text-surface-400">
                        {source.type || 'vault'}
                      </span>
                      {source.title || source.slug}
                    </span>
                    <span className="shrink-0 text-surface-400">열기</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
      {isThinking && (
        <div className="mr-4 rounded-2xl border border-surface-200 bg-white p-4 text-sm font-bold text-surface-500 shadow-sm">
          공개 콘텐츠를 찾아보고 있어요…
        </div>
      )}
    </div>
  );
}
