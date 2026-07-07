'use client';

import { useEffect, useState } from 'react';
import { useUiStore } from '@/shared/model/uiStore';
import { usePerformanceMode } from '@/shared/model/usePerformanceMode';
import { useVaultNoteData } from '@/features/vault/lib/useVaultNote';
import { useVaultNoteLayout } from '@/widgets/vault/model/useVaultNoteLayout';
import { VaultNoteSidebar } from '@/widgets/vault/ui/layout/VaultNoteSidebar';
import { VaultNoteMainPanel } from '@/widgets/vault/ui/layout/VaultNoteMainPanel';
import { VaultAgentChatPanel } from './VaultAgentChatPanel';

export function VaultNoteLayout({ slug: initialSlug }: { slug?: string }) {
  const { theme } = useUiStore();
  const { isTouchDevice } = usePerformanceMode();
  const [isAgentOpen, setIsAgentOpen] = useState(false);
  const {
    activeFolderId,
    handleFolderSelect,
    handleResizeStart,
    isDesktop,
    isMobileOpen,
    setActiveFolderId,
    setIsMobileOpen,
    sidebarWidth,
    slug,
  } = useVaultNoteLayout(initialSlug);
  const {
    note,
    backlinks,
    folders,
    isNoteLoading,
    isFoldersLoading,
    isError,
    localGraph,
    colorMap,
    titleSlugMap,
  } = useVaultNoteData(slug);

  useEffect(() => {
    if (note?.folderId) {
      setActiveFolderId(note.folderId);
    }
  }, [note?.folderId, setActiveFolderId]);

  if (isError) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-black text-surface-300">404</h1>
          <p className="text-surface-500">Memory not found in the neural network.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex overflow-hidden bg-transparent lg:p-4 lg:gap-4">
      {isMobileOpen && (
        <div
          className={`fixed inset-0 z-[45] lg:hidden ${isTouchDevice ? 'bg-surface-900/25' : 'bg-surface-900/20 backdrop-blur-sm'}`}
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <VaultNoteSidebar
        activeFolderId={activeFolderId}
        folders={folders}
        isDesktop={isDesktop}
        isFoldersLoading={isFoldersLoading}
        isMobileOpen={isMobileOpen}
        isTouchDevice={isTouchDevice}
        activeNoteSlug={note?.slug}
        onFolderSelect={handleFolderSelect}
        onResizeStart={handleResizeStart}
        sidebarWidth={sidebarWidth}
      />
      <VaultNoteMainPanel
        backlinks={backlinks}
        colorMap={colorMap}
        isNoteLoading={isNoteLoading}
        isTouchDevice={isTouchDevice}
        localGraph={localGraph}
        note={note}
        onFolderClick={setActiveFolderId}
        theme={theme}
        titleSlugMap={titleSlugMap}
      />

      <button
        type="button"
        onClick={() => setIsAgentOpen(true)}
        className="fixed right-6 top-28 z-40 hidden items-center gap-2 rounded-full border border-cyan-200 bg-white/95 px-5 py-3 text-sm font-black text-surface-900 shadow-lg shadow-cyan-500/10 transition hover:-translate-y-0.5 hover:border-cyan-300 hover:text-cyan-700 hover:shadow-xl dark:border-cyan-400/30 dark:bg-surface-950/95 dark:text-white dark:hover:text-cyan-200 lg:flex"
      >
        <span aria-hidden>꼬</span>
        Vault에게 묻기
      </button>

      {isAgentOpen && (
        <VaultAgentChatPanel
          graphData={localGraph}
          activeFolderName={note?.title || slug}
          onClose={() => setIsAgentOpen(false)}
        />
      )}

      <button
        type="button"
        onClick={() => setIsAgentOpen(open => !open)}
        className="lg:hidden fixed bottom-24 right-6 z-50 p-4 rounded-full border border-cyan-300 bg-white text-surface-900 shadow-xl shadow-cyan-500/10 hover:scale-105 active:scale-95 transition-all outline-none"
        aria-label={isAgentOpen ? 'Vault Agent 닫기' : 'Vault Agent 열기'}
      >
        {isAgentOpen ? (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H7a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v4a4 4 0 0 1-4 4h-3l-4 4v-4Z" />
          </svg>
        )}
      </button>

      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed bottom-6 right-6 z-50 p-4 rounded-full bg-surface-900 text-white shadow-xl hover:scale-105 active:scale-95 transition-all outline-none border border-white/10"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          {isMobileOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>
    </div>
  );
}
