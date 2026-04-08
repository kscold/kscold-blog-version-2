'use client';

import { useRouter } from 'next/navigation';
import { BacklinkList } from '@/entities/vault/ui/BacklinkList';
import { VaultNoteContent } from '@/entities/vault/ui/VaultNoteContent';
import { ClientVaultGraph } from '@/widgets/vault/ui/ClientVaultGraph';
import type { GraphLink, GraphNode, VaultNote } from '@/types/vault';
import type { useUiStore } from '@/shared/model/uiStore';

type ThemeMode = ReturnType<typeof useUiStore.getState>['theme'];

interface VaultNoteMainPanelProps {
  backlinks: VaultNote[];
  colorMap: Record<string, string>;
  isNoteLoading: boolean;
  isTouchDevice: boolean;
  localGraph: { nodes: GraphNode[]; links: GraphLink[] } | null;
  note: VaultNote | undefined;
  onFolderClick: (folderId: string | null) => void;
  theme: ThemeMode;
  titleSlugMap: Record<string, string>;
}

export function VaultNoteMainPanel({
  backlinks,
  colorMap,
  isNoteLoading,
  isTouchDevice,
  localGraph,
  note,
  onFolderClick,
  theme,
  titleSlugMap,
}: VaultNoteMainPanelProps) {
  const router = useRouter();

  return (
    <main className={`flex-1 relative p-4 sm:p-6 lg:p-12 overflow-y-auto custom-scrollbar w-full h-full min-w-0 lg:rounded-3xl border-0 lg:border ${isTouchDevice ? 'bg-white dark:bg-surface-950 lg:shadow-sm border-surface-200 dark:border-surface-800' : 'bg-white/40 dark:bg-surface-950/40 backdrop-blur-md lg:shadow-sm border-surface-200/50 dark:border-surface-800/50'}`}>
      <div className="mb-8">
        <button
          onClick={() => {
            if (note?.folderId) {
              router.push(`/vault?folder=${note.folderId}`);
              return;
            }

            router.push('/vault');
          }}
          className={`px-4 py-2 rounded-full border text-surface-600 dark:text-surface-300 hover:text-surface-900 dark:hover:text-white text-sm font-bold flex items-center gap-2 shadow-sm transition-all ${isTouchDevice ? 'bg-white dark:bg-surface-900 border-surface-200 dark:border-surface-800' : 'bg-surface-50/80 dark:bg-surface-900/80 border-surface-200 dark:border-surface-800 backdrop-blur-xl hover:scale-105'}`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>상위 폴더로</span>
        </button>
      </div>
      {isNoteLoading ? (
        <div className="space-y-8 animate-pulse max-w-4xl mx-auto">
          <div className="h-12 bg-surface-200/50 rounded-2xl w-3/4" />
          <div className="h-4 bg-surface-200/50 rounded-full w-1/4" />
          <div className="space-y-4 pt-12">
            <div className="h-4 bg-surface-200/50 rounded-full w-full" />
            <div className="h-4 bg-surface-200/50 rounded-full w-5/6" />
            <div className="h-4 bg-surface-200/50 rounded-full w-4/6" />
          </div>
        </div>
      ) : note ? (
        <div className="max-w-4xl mx-auto pb-24">
          <VaultNoteContent note={note} theme={theme} titleSlugMap={titleSlugMap} />
          <BacklinkList backlinks={backlinks} />

          <div className="mt-16 pt-8 border-t border-surface-200/50 h-[400px]">
            <h3 className="text-sm font-bold text-surface-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
              Synapse Map Insight
            </h3>
            {localGraph && (
              <ClientVaultGraph
                graphData={localGraph}
                activeNodeSlug={note.slug}
                folderColorMap={colorMap}
                onFolderClick={onFolderClick}
                theme={theme}
              />
            )}
          </div>
        </div>
      ) : null}
    </main>
  );
}
