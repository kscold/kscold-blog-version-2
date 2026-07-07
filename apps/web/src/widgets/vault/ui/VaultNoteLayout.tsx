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
        className="group fixed right-6 top-28 z-40 hidden items-center justify-center gap-2 rounded-2xl border border-surface-200 bg-white px-6 py-3 text-sm font-bold text-surface-600 shadow-sm transition-all duration-300 hover:border-surface-900 hover:text-surface-900 hover:shadow-md active:scale-95 dark:border-surface-800 dark:bg-surface-950 dark:text-surface-300 dark:hover:border-white dark:hover:text-white lg:flex"
      >
        <svg className="h-4 w-4 transition-transform duration-300 group-hover:rotate-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c.251.023.501.05.75.082m-.75-.082a24.301 24.301 0 0 0-4.5 0m4.5 0v.75m4.5-.75v5.714c0 .597.237 1.169.659 1.591L19 14.5m-4.5-11.396c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m-4.5 0v.75M5 14.5h14m-14 0v.75A2.25 2.25 0 0 0 7.25 17.5h9.5A2.25 2.25 0 0 0 19 15.25v-.75" />
        </svg>
        Agent에게 묻기
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
        className="lg:hidden fixed bottom-24 right-6 z-50 rounded-2xl border border-surface-200 bg-white p-4 text-surface-700 shadow-lg transition-all hover:border-surface-900 hover:text-surface-900 active:scale-95 outline-none"
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
