'use client';

import { useUiStore } from '@/shared/model/uiStore';
import { usePerformanceMode } from '@/shared/model/usePerformanceMode';
import { useVaultNoteData } from '@/features/vault/lib/useVaultNote';
import { useVaultNoteLayout } from '@/widgets/vault/model/useVaultNoteLayout';
import { VaultNoteSidebar } from '@/widgets/vault/ui/layout/VaultNoteSidebar';
import { VaultNoteMainPanel } from '@/widgets/vault/ui/layout/VaultNoteMainPanel';

export function VaultNoteLayout({ slug: initialSlug }: { slug?: string }) {
  const { theme } = useUiStore();
  const { isTouchDevice } = usePerformanceMode();
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
