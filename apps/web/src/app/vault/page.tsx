'use client';

import { ClientVaultGraph } from '@/components/vault/ClientVaultGraph';
import { VaultFolderTree } from '@/components/vault/VaultFolderTree';
import { useVaultFolders, useVaultGraph } from '@/hooks/useVault';

export default function VaultIndexPage() {
  const { data: folders, isLoading: isFoldersLoading } = useVaultFolders();
  const { data: graphData, isLoading: isGraphLoading } = useVaultGraph();

  return (
    <div className="flex-1 flex h-full w-full max-w-[1600px] mx-auto overflow-hidden">
      {/* Sidebar: Folder Tree */}
      <aside className="fixed top-[88px] left-4 bottom-4 w-56 z-40 overflow-y-auto transition-transform duration-300 -translate-x-[150%] lg:translate-x-0 bg-white/60 backdrop-blur-xl border border-surface-200/50 rounded-2xl shadow-sm custom-scrollbar">
        <div className="p-6 space-y-8 relative">
          <div>
            <h2 className="text-xs font-bold text-surface-400 mb-4 tracking-[0.2em] uppercase">
              Core Database
            </h2>
            {isFoldersLoading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-4 bg-surface-200/50 rounded-full w-2/3" />
                <div className="h-4 bg-surface-200/50 rounded-full w-1/2" />
                <div className="h-4 bg-surface-200/50 rounded-full w-3/4" />
              </div>
            ) : (
              <VaultFolderTree folders={folders || []} />
            )}
          </div>
        </div>
      </aside>

      {/* Main Graph View */}
      <main className="flex-1 relative p-4 sm:p-6 lg:p-8 min-h-[500px] lg:pl-[260px] w-full">
        {isGraphLoading ? (
          <div className="w-full h-full flex items-center justify-center relative overflow-hidden rounded-[32px] border border-surface-200/50 bg-white/40 backdrop-blur-md">
            <div className="w-8 h-8 border-2 border-surface-300 border-t-surface-900 rounded-full animate-spin"></div>
          </div>
        ) : graphData ? (
          <ClientVaultGraph graphData={graphData} />
        ) : (
          <div className="text-surface-500">No Data</div>
        )}
      </main>
    </div>
  );
}
