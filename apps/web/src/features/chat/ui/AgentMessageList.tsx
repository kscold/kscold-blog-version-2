'use client';

import Link from 'next/link';
import { MarkdownContent } from '@/shared/ui/MarkdownContent';
import {
  linkAgentSourceCitations,
  sourceHref,
  type AgentMessage,
} from '@/features/chat/lib/agentConstants';

export function AgentMessageList({
  messages,
}: {
  messages: AgentMessage[];
}) {
  return (
    <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain bg-surface-50 p-3 custom-scrollbar sm:p-4">
      {messages.map(message => {
        const currentStage = message.stages?.at(-1);
        const visibleStages = message.isStreaming ? [] : message.stages?.slice(0, 5) || [];
        const linkedContent = linkAgentSourceCitations(message.content, message.sources);

        return (
          <div
            key={message.id}
            className={`min-w-0 rounded-2xl p-3 text-sm leading-7 shadow-sm sm:p-4 ${
              message.role === 'user'
                ? 'ml-8 bg-surface-900 text-white'
                : 'mr-0 border border-surface-200 bg-white text-surface-700 sm:mr-4'
            }`}
          >
            {message.role === 'assistant' ? (
              <>
                {message.isStreaming && (
                  <div
                    className="mb-3 flex items-start gap-2.5 rounded-xl border border-cyan-100 bg-cyan-50/70 px-3 py-2.5 text-xs leading-5 text-surface-600"
                    aria-live="polite"
                  >
                    <span className="relative mt-1 flex h-2 w-2 shrink-0">
                      <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-cyan-400 opacity-60" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-500" />
                    </span>
                    <span className="min-w-0">
                      <span className="font-black text-cyan-700">
                        {currentStage?.name || '답변 준비'}
                      </span>
                      <span className="ml-1.5 text-surface-500">
                        {currentStage?.detail || '질문을 이해하고 있습니다.'}
                      </span>
                    </span>
                  </div>
                )}
                {message.content ? (
                  <MarkdownContent content={linkedContent} theme="light" size="sm" />
                ) : (
                  <div className="flex h-8 items-center gap-1.5 px-1" aria-label="답변을 준비하고 있습니다">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-surface-300 [animation-delay:-0.2s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-surface-300 [animation-delay:-0.1s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-surface-300" />
                  </div>
                )}
              </>
            ) : (
              <p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                {message.content}
              </p>
            )}
            {visibleStages.length > 0 && message.role === 'assistant' && (
              <div className="mt-3 grid gap-1.5">
                {visibleStages.map(stage => (
                  <div
                    key={`${message.id}-${stage.name}-${stage.detail}`}
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
                  참고한 기록
                </p>
                <div className="grid gap-2">
                  {message.sources.slice(0, 5).map(source => (
                    <Link
                      key={`${source.type}-${source.id}`}
                      href={sourceHref(source)}
                      className="group block min-w-0 rounded-xl border border-surface-200 bg-surface-50 px-3 py-2.5 text-xs font-bold text-surface-600 transition hover:border-surface-900 hover:bg-white hover:text-surface-900"
                    >
                      <span className="flex min-w-0 items-center justify-between gap-2">
                        <span className="min-w-0 truncate [overflow-wrap:anywhere]">
                          <span className="mr-2 font-mono text-[9px] uppercase tracking-[0.14em] text-surface-400">
                            {source.type || 'vault'}
                          </span>
                          {source.title || source.slug}
                        </span>
                        <span className="shrink-0 text-surface-400 transition group-hover:text-surface-700">
                          열기
                        </span>
                      </span>
                      {source.excerpt && (
                        <span className="mt-1.5 block line-clamp-2 break-words text-[11px] font-normal leading-5 text-surface-500 [overflow-wrap:anywhere]">
                          {source.excerpt}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
