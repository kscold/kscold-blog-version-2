'use client';

import { VaultFolderTree } from '@/widgets/vault/ui/VaultFolderTree';
import { VaultFolder } from '@/types/vault';

interface VaultNoteSidebarProps {
  activeFolderId: string | null;
  folders: VaultFolder[];
  isDesktop: boolean;
  isFoldersLoading: boolean;
  isMobileOpen: boolean;
  isTouchDevice: boolean;
  sidebarWidth: number;
  onFolderSelect: (folderId: string | null) => void;
  onResizeStart: (event: React.MouseEvent) => void;
}

export function VaultNoteSidebar({
  activeFolderId,
  folders,
  isDesktop,
  isFoldersLoading,
  isMobileOpen,
  isTouchDevice,
  onFolderSelect,
  onResizeStart,
  sidebarWidth,
}: VaultNoteSidebarProps) {
  return (
    <aside
      className={`fixed lg:relative top-0 lg:top-0 left-0 z-50 lg:z-10 overflow-y-auto transition-transform duration-300 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} ${isTouchDevice ? 'bg-white dark:bg-surface-900 border-r border-surface-200 dark:border-surface-800 shadow-xl' : 'bg-white/90 dark:bg-surface-900/90 backdrop-blur-3xl border-r lg:border border-surface-200/50 dark:border-surface-800 shadow-2xl lg:shadow-sm'} lg:rounded-3xl custom-scrollbar w-80 h-full shrink-0 flex flex-col`}
      style={isDesktop ? { width: `${sidebarWidth}px` } : undefined}
    >
      <div className="p-6 flex-1 space-y-8 relative">
        <div>
          <h2 className="text-[10px] font-black text-surface-400 mb-6 tracking-[0.25em] uppercase">
            Core Database
          </h2>
          {isFoldersLoading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-4 bg-surface-200/50 rounded-full w-2/3" />
              <div className="h-4 bg-surface-200/50 rounded-full w-1/2" />
            </div>
          ) : (
            <VaultFolderTree
              folders={folders}
              activeFolderId={activeFolderId}
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
