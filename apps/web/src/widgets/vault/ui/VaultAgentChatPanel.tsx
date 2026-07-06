'use client';

import { FormEvent, useMemo, useRef, useState } from 'react';
import type { GraphData } from '@/types/vault';
import { sendVaultAgentMessage, type VaultAgentSource } from '@/features/vault/api/vaultAgentApi';

interface VaultAgentChatPanelProps {
  graphData: GraphData | null | undefined;
  activeFolderName?: string;
  onClose: () => void;
}

interface AgentMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  stages?: AgentStage[];
  sources?: VaultAgentSource[];
}

interface AgentStage {
  name: string;
  detail: string;
}

const starterPrompts = [
  '이 주제에서 먼저 볼 노트 알려줘',
  'Python 관련 노트를 학습 순서로 묶어줘',
  '지금 노트들이 어떻게 이어지는지 설명해줘',
];

export function VaultAgentChatPanel({ graphData, activeFolderName, onClose }: VaultAgentChatPanelProps) {
  const [messages, setMessages] = useState<AgentMessage[]>([
    {
      id: 1,
      role: 'assistant',
      content:
        '궁금한 걸 물어보면 Vault 안의 노트와 연결 관계를 찾아서 같이 정리해볼게요. 필요한 경우 최신 웹 자료도 보조로 확인할 수 있습니다.',
      stages: [
        { name: '읽기', detail: '질문과 가까운 노트를 먼저 찾습니다.' },
        { name: '연결', detail: '링크와 백링크로 주변 노트를 넓혀봅니다.' },
        { name: '정리', detail: '참고한 노트와 함께 답을 정리합니다.' },
      ],
    },
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const nextIdRef = useRef(2);

  const graphSummary = useMemo(() => {
    const nodes = graphData?.nodes ?? [];
    const links = graphData?.links ?? [];
    const visibleNodeCount = nodes.length;
    const noteCount = nodes.filter(node => node.isFolder !== true).length;
    const folderCount = nodes.filter(node => node.isFolder).length;
    const topNodes = nodes
      .filter(node => !node.isFolder)
      .slice(0, 4)
      .map(node => node.name)
      .filter(Boolean);

    return {
      noteCount,
      visibleNodeCount,
      folderCount,
      linkCount: links.length,
      topNodes,
    };
  }, [graphData]);

  const sendMessage = (event?: FormEvent) => {
    event?.preventDefault();
    const question = input.trim();
    if (!question || isThinking) return;

    const userMessage: AgentMessage = {
      id: nextIdRef.current++,
      role: 'user',
      content: question,
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsThinking(true);

    sendVaultAgentMessage(question, activeFolderName)
      .then(response => {
        const assistantMessage: AgentMessage = {
          id: nextIdRef.current++,
          role: 'assistant',
          content: response.answer,
          stages: response.stages,
          sources: response.sources,
        };
        setMessages(prev => [...prev, assistantMessage]);
      })
      .catch(() => {
        const assistantMessage: AgentMessage = {
          id: nextIdRef.current++,
          role: 'assistant',
          content: buildDraftAnswer(question, graphSummary, activeFolderName),
          stages: [
            {
              name: 'Fallback',
              detail: '서버 응답이 늦어 현재 화면의 그래프 정보로 먼저 정리했습니다.',
            },
            {
              name: '화면 노트',
              detail: `${graphSummary.noteCount}개 노트와 ${graphSummary.linkCount}개 연결을 화면 컨텍스트로 참고했습니다.`,
            },
          ],
        };
        setMessages(prev => [...prev, assistantMessage]);
      })
      .finally(() => setIsThinking(false));
  };

  const applyStarter = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <aside className="absolute inset-y-3 right-3 z-30 flex w-[min(420px,calc(100%-1.5rem))] flex-col overflow-hidden rounded-[2rem] border border-surface-200/70 bg-white/95 shadow-2xl backdrop-blur-2xl dark:border-surface-800 dark:bg-surface-950/95">
      <div className="border-b border-surface-200/70 p-5 dark:border-surface-800">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.28em] text-cyan-500">
              Vault Assistant
            </p>
            <h2 className="mt-2 text-xl font-black tracking-tight text-surface-950 dark:text-white">
              Vault에게 묻기
            </h2>
            <p className="mt-2 text-xs font-medium leading-5 text-surface-500 dark:text-surface-400">
              노트 본문, 링크, 백링크를 같이 훑어서 읽을 순서와 맥락을 잡아줍니다.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-surface-200 bg-white p-2 text-surface-500 transition hover:border-surface-400 hover:text-surface-900 dark:border-surface-800 dark:bg-surface-900 dark:text-surface-300"
            aria-label="Agent chat 닫기"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <AgentStat label="Nodes" value={graphSummary.visibleNodeCount} />
          <AgentStat label="Links" value={graphSummary.linkCount} />
          <AgentStat label="Folders" value={graphSummary.folderCount} />
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4 custom-scrollbar">
        {messages.map(message => (
          <div
            key={message.id}
            className={`rounded-2xl p-4 text-sm leading-7 ${
              message.role === 'user'
                ? 'ml-8 bg-surface-950 text-white dark:bg-white dark:text-surface-950'
                : 'mr-6 border border-surface-200 bg-white text-surface-700 shadow-sm dark:border-surface-800 dark:bg-surface-900 dark:text-surface-200'
            }`}
          >
            <p className="whitespace-pre-wrap">{message.content}</p>
            {message.stages && (
              <div className="mt-4 space-y-2">
                {message.stages.map(stage => (
                  <div key={stage.name} className="rounded-xl bg-surface-50 px-3 py-2 text-xs leading-5 text-surface-600 dark:bg-surface-950 dark:text-surface-300">
                    <span className="font-black text-cyan-600 dark:text-cyan-300">{stage.name}</span>
                    <span className="mx-2 text-surface-300">·</span>
                    {stage.detail}
                  </div>
                ))}
              </div>
            )}
            {message.sources && message.sources.length > 0 && (
              <div className="mt-4 border-t border-surface-200 pt-3 dark:border-surface-800">
                <p className="mb-2 font-mono text-[10px] font-black uppercase tracking-[0.2em] text-surface-400">
                  Sources
                </p>
                <div className="flex flex-wrap gap-2">
                  {message.sources.map(source => (
                    <a
                      key={source.id}
                      href={`/vault/${source.slug}`}
                      className="rounded-full border border-surface-200 bg-surface-50 px-3 py-1.5 text-xs font-bold text-surface-600 transition hover:border-cyan-300 hover:text-cyan-700 dark:border-surface-800 dark:bg-surface-950 dark:text-surface-300"
                    >
                      {source.title} · {(source.score * 100).toFixed(1)}%
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {isThinking && (
          <div className="mr-6 rounded-2xl border border-surface-200 bg-white p-4 text-sm font-bold text-surface-500 shadow-sm dark:border-surface-800 dark:bg-surface-900 dark:text-surface-300">
            노트를 찾아보고 있어요…
          </div>
        )}
      </div>

      <div className="border-t border-surface-200/70 p-4 dark:border-surface-800">
        <div className="mb-3 flex flex-wrap gap-2">
          {starterPrompts.map(prompt => (
            <button
              key={prompt}
              type="button"
              onClick={() => applyStarter(prompt)}
              className="shrink-0 rounded-full border border-surface-200 bg-surface-50 px-3 py-2 text-xs font-bold text-surface-600 transition hover:border-cyan-300 hover:text-cyan-700 dark:border-surface-800 dark:bg-surface-900 dark:text-surface-300"
            >
              {prompt}
            </button>
          ))}
        </div>
        <form onSubmit={sendMessage} className="flex gap-2">
          <input
            value={input}
            onChange={event => setInput(event.target.value)}
            placeholder="Vault에 대해 물어보기..."
            className="min-w-0 flex-1 rounded-2xl border border-surface-200 bg-surface-50 px-4 py-3 text-sm font-bold text-surface-900 outline-none transition focus:border-cyan-300 dark:border-surface-800 dark:bg-surface-900 dark:text-white"
          />
          <button
            type="submit"
            disabled={!input.trim() || isThinking}
            className="rounded-2xl bg-surface-950 px-4 py-3 text-sm font-black text-white transition hover:bg-surface-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-surface-950"
          >
            전송
          </button>
        </form>
      </div>
    </aside>
  );
}

function AgentStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-surface-200 bg-surface-50 px-3 py-2 dark:border-surface-800 dark:bg-surface-900">
      <p className="font-mono text-[10px] font-black uppercase tracking-[0.16em] text-surface-400">{label}</p>
      <p className="mt-1 text-lg font-black text-surface-950 dark:text-white">{value}</p>
    </div>
  );
}

function buildDraftAnswer(
  question: string,
  graphSummary: { noteCount: number; linkCount: number; topNodes: string[] },
  activeFolderName?: string
) {
  const focus = activeFolderName ? `${activeFolderName} 폴더` : '전체 Vault';
  const sampleNotes = graphSummary.topNodes.length > 0
    ? `우선 후보 노트는 ${graphSummary.topNodes.join(', ')} 쪽입니다.`
    : '아직 후보 노트를 고르기엔 그래프 데이터가 적습니다.';

  return [
    `질문은 “${question}”로 이해했어요.`,
    `${focus} 기준으로 ${graphSummary.noteCount}개 노트와 ${graphSummary.linkCount}개 연결을 먼저 훑는 흐름이 좋습니다.`,
    sampleNotes,
    '실제 연결 단계에서는 LangGraph에서 plan → retrieve → validate → respond 노드로 나누고, gRPC 스트림으로 reasoning 단계와 최종 답변을 UI에 순차 표시하면 됩니다.',
  ].join('\n\n');
}
