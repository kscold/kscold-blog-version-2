'use client';

import { VaultFolderTree } from './VaultFolderTree';
import type { VaultFolder } from '@/shared/model/types/vault';

interface VaultGraphSidebarProps {
  isMobileOpen: boolean;
  isDesktop: boolean;
  isTouchDevice: boolean;
  sidebarWidth: number;
  folders: VaultFolder[];
  isFoldersLoading: boolean;
  activeFolderId: string | null;
  activeFolderParentId: string | null;
  onFolderSelect: (id: string | null) => void;
  onFolderHover?: (id: string | null) => void;
  onClose: () => void;
  onResizeStart: (e: React.MouseEvent) => void;
}

export function VaultGraphSidebar({
  isMobileOpen,
  isDesktop,
  isTouchDevice,
  sidebarWidth,
  folders,
  isFoldersLoading,
  activeFolderId,
  activeFolderParentId,
  onFolderSelect,
  onFolderHover,
  onClose,
  onResizeStart,
}: VaultGraphSidebarProps) {
  return (
    <aside
      className={`fixed bottom-0 left-0 top-0 z-50 h-full w-[min(86vw,340px)] shrink-0 transform overflow-y-auto rounded-r-[28px] border-r transition-transform duration-300 lg:relative lg:inset-auto lg:z-10 lg:h-full lg:w-80 lg:translate-x-0 lg:rounded-3xl ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} ${isTouchDevice ? 'border-surface-200 bg-white shadow-xl dark:border-surface-800 dark:bg-surface-900' : 'border-surface-200/50 bg-white/95 shadow-2xl backdrop-blur-3xl dark:border-surface-800 dark:bg-surface-900/95 lg:shadow-sm'} custom-scrollbar flex flex-col`}
      style={isDesktop ? { width: `${sidebarWidth}px` } : undefined}
    >
      <div className="flex-1 space-y-6 p-5 pb-[calc(env(safe-area-inset-bottom,0px)+1.5rem)] lg:p-6 lg:pb-6">
        {activeFolderId && (
          <div className="lg:hidden">
            <button
              onClick={() => onFolderSelect(activeFolderParentId)}
              className={`w-full px-4 py-2 rounded-full border text-surface-600 dark:text-surface-300 hover:text-surface-900 dark:hover:text-white text-sm font-bold flex items-center gap-2 shadow-sm transition-all ${isTouchDevice ? 'bg-white dark:bg-surface-900 border-surface-200 dark:border-surface-800' : 'bg-surface-50/80 dark:bg-surface-900/80 border-surface-200 dark:border-surface-800 backdrop-blur-xl hover:scale-105'}`}
            >
              <svg
                className="w-4 h-4 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>상위 폴더로</span>
            </button>
          </div>
        )}
        <div>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-[10px] font-black text-surface-400 tracking-[0.25em] uppercase">
              Vault 목록
            </h2>
            <button
              onClick={onClose}
              aria-label="폴더 닫기"
              className="lg:hidden flex h-8 w-8 items-center justify-center rounded-lg text-surface-400 transition hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-white"
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
              <div className="h-4 bg-surface-200/50 rounded-full w-3/4" />
            </div>
          ) : (
            <VaultFolderTree
              folders={folders}
              activeFolderId={activeFolderId}
              onFolderSelect={onFolderSelect}
              onFolderHover={onFolderHover}
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
