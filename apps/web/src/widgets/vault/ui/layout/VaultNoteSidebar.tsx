'use client';

import { VaultFolderTree } from '@/widgets/vault/ui/VaultFolderTree';
import { VaultFolder } from '@/shared/model/types/vault';

interface VaultNoteSidebarProps {
  activeFolderId: string | null;
  activeNoteSlug?: string;
  folders: VaultFolder[];
  isDesktop: boolean;
  isFoldersLoading: boolean;
  isMobileOpen: boolean;
  isTouchDevice: boolean;
  sidebarWidth: number;
  onFolderSelect: (folderId: string | null) => void;
  onClose: () => void;
  onResizeStart: (event: React.MouseEvent) => void;
}

export function VaultNoteSidebar({
  activeFolderId,
  activeNoteSlug,
  folders,
  isDesktop,
  isFoldersLoading,
  isMobileOpen,
  isTouchDevice,
  onFolderSelect,
  onClose,
  onResizeStart,
  sidebarWidth,
}: VaultNoteSidebarProps) {
  return (
    <aside
      className={`fixed bottom-0 left-0 top-0 z-50 h-full w-[min(86vw,340px)] shrink-0 transform overflow-y-auto rounded-r-[28px] border-r transition-transform duration-300 lg:relative lg:inset-auto lg:z-10 lg:h-full lg:w-80 lg:translate-x-0 lg:rounded-3xl ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} ${isTouchDevice ? 'border-surface-200 bg-white shadow-xl dark:border-surface-800 dark:bg-surface-900' : 'border-surface-200/50 bg-white/95 shadow-2xl backdrop-blur-3xl dark:border-surface-800 dark:bg-surface-900/95 lg:shadow-sm'} custom-scrollbar flex flex-col`}
      style={isDesktop ? { width: `${sidebarWidth}px` } : undefined}
    >
      <div className="flex-1 space-y-6 p-5 pb-[calc(env(safe-area-inset-bottom,0px)+1.5rem)] lg:p-6 lg:pb-6">
        <div>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-[10px] font-black text-surface-400 tracking-[0.25em] uppercase">
              Vault 목록
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="목록 닫기"
              className="lg:hidden flex h-9 w-9 items-center justify-center rounded-xl text-surface-400 transition hover:bg-surface-100 hover:text-surface-900 dark:hover:bg-surface-800 dark:hover:text-white"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {isFoldersLoading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-4 bg-surface-200/50 rounded-full w-2/3" />
              <div className="h-4 bg-surface-200/50 rounded-full w-1/2" />
            </div>
          ) : (
            <VaultFolderTree
              folders={folders}
              activeFolderId={activeFolderId}
              activeNoteSlug={activeNoteSlug}
              onFolderSelect={onFolderSelect}
            />
          )}
        </div>
      </div>

      <div
        className="hidden lg:block absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-surface-300/50 dark:hover:bg-surface-600/50 transition-colors rounded-r-3xl"
        onMouseDown={onResizeStart}
      />
    </aside>
  );
}
