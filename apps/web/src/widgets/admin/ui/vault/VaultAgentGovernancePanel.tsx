'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { fetchVaultAgentRuns } from '@/features/chat';

export function VaultAgentGovernancePanel() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'vault', 'agent', 'runs'],
    queryFn: () => fetchVaultAgentRuns(0, 8),
  });
  const runs = data?.content ?? [];

  return (
    <section className="overflow-hidden rounded-3xl border border-surface-200 bg-white">
      <div className="flex flex-col gap-3 border-b border-surface-100 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-mono text-xs font-black uppercase tracking-[0.24em] text-cyan-500">Agent Governance</p>
          <h2 className="mt-2 text-2xl font-black text-surface-950">Vault Agent 사용 흐름</h2>
          <p className="mt-1 text-sm font-medium text-surface-500">
            사용자가 어떤 질문을 했고, 어떤 Vault 노트를 근거로 답했는지 확인합니다.
          </p>
        </div>
        <div className="rounded-2xl bg-cyan-50 px-4 py-3 text-sm font-black text-cyan-700">
          최근 {data?.totalElements ?? 0}건
        </div>
      </div>

      <div className="divide-y divide-surface-100">
        {isLoading && (
          <div className="space-y-3 p-5">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="h-20 rounded-2xl bg-surface-100 animate-pulse" />
            ))}
          </div>
        )}

        {!isLoading && runs.length === 0 && (
          <div className="p-8 text-center text-sm font-bold text-surface-500">
            아직 Agent 사용 기록이 없습니다.
          </div>
        )}

        {runs.map(run => (
          <article key={run.id} className="grid gap-4 p-5 lg:grid-cols-[1fr_360px]">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-surface-100 px-3 py-1 text-xs font-black text-surface-600">
                  {formatDate(run.createdAt)}
                </span>
                <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-black text-cyan-700">
                  sources {run.sourceCount}
                </span>
              </div>
              <h3 className="mt-3 text-lg font-black text-surface-950">{run.question || '질문 기록 없음'}</h3>
              {run.answerPreview && (
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-surface-600">{run.answerPreview}</p>
              )}
            </div>

            <div className="space-y-2">
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-surface-400">Used Notes</p>
              <div className="flex flex-wrap gap-2">
                {run.sources.slice(0, 5).map(source => (
                  <Link
                    key={`${run.id}-${source.id}-${source.slug}`}
                    href={source.path || `/vault/${encodeURIComponent(source.slug)}`}
                    className="rounded-full border border-surface-200 bg-surface-50 px-3 py-2 text-xs font-black text-surface-600 transition hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-700"
                  >
                    {(source.type ? `${source.type} · ` : '') + (source.title || source.slug)}
                  </Link>
                ))}
                {run.sources.length === 0 && (
                  <span className="text-xs font-bold text-surface-400">근거 노트 기록 없음</span>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function formatDate(value?: string) {
  if (!value) {
    return '기록 시간 없음';
  }
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}
