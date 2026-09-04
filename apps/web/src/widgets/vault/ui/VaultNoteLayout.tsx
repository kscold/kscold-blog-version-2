'use client';

import { useEffect } from 'react';
import { useUiStore } from '@/shared/model/uiStore';
import { usePerformanceMode } from '@/shared/model/usePerformanceMode';
import { useVaultNoteData } from '@/features/vault';
import { useVaultNoteLayout } from '@/widgets/vault/model/useVaultNoteLayout';
import { VaultNoteSidebar } from '@/widgets/vault/ui/layout/VaultNoteSidebar';
import { VaultNoteMainPanel } from '@/widgets/vault/ui/layout/VaultNoteMainPanel';
import { VaultMobileListButton } from '@/widgets/vault/ui/VaultMobileListButton';
import type { VaultNote } from '@/shared/model/types/vault';

interface VaultNoteLayoutProps {
  slug?: string;
  initialNote?: VaultNote;
}

export function VaultNoteLayout({ slug: initialSlug, initialNote }: VaultNoteLayoutProps) {
  const { theme } = useUiStore();
  const { isTouchDevice, allowRichEffects } = usePerformanceMode();
  const useSolidSurface = isTouchDevice || !allowRichEffects;
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
  } = useVaultNoteData(slug, initialNote);

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

  const openAgentChat = () => {
    window.dispatchEvent(new Event('kscold-agent-chat:open'));
  };

  return (
    <div className="absolute inset-0 flex overflow-hidden bg-transparent lg:p-4 lg:gap-4">
      {isMobileOpen && (
        <div
          className={`fixed inset-0 z-[45] lg:hidden ${useSolidSurface ? 'bg-surface-900/25' : 'bg-surface-900/20 backdrop-blur-sm'}`}
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <VaultNoteSidebar
        activeFolderId={activeFolderId}
        folders={folders}
        isDesktop={isDesktop}
        isFoldersLoading={isFoldersLoading}
        isMobileOpen={isMobileOpen}
        isTouchDevice={useSolidSurface}
        activeNoteSlug={note?.slug}
        onFolderSelect={handleFolderSelect}
        onClose={() => setIsMobileOpen(false)}
        onResizeStart={handleResizeStart}
        sidebarWidth={sidebarWidth}
      />
      <VaultNoteMainPanel
        backlinks={backlinks}
        colorMap={colorMap}
        isNoteLoading={isNoteLoading}
        isTouchDevice={useSolidSurface}
        localGraph={localGraph}
        note={note}
        onOpenChat={openAgentChat}
        onOpenFolders={() => setIsMobileOpen(true)}
        onFolderClick={setActiveFolderId}
        theme={theme}
        titleSlugMap={titleSlugMap}
      />

      <VaultMobileListButton onClick={() => setIsMobileOpen(true)} />
    </div>
  );
}
