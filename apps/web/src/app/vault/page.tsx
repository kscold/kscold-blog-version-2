'use client';

import { useState, useMemo } from 'react';
import { ClientVaultGraph } from '@/components/vault/ClientVaultGraph';
import { VaultFolderTree } from '@/components/vault/VaultFolderTree';
import { useVaultFolders, useVaultGraph } from '@/hooks/useVault';
import { buildFolderColorMap, getAggregatedGraph } from '@/lib/vault-utils';

export default function VaultIndexPage() {
  const { data: folders, isLoading: isFoldersLoading } = useVaultFolders();
  const { data: graphData, isLoading: isGraphLoading } = useVaultGraph();

  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Derive filtered graph data and colors
  const { filteredGraph, colorMap } = useMemo(() => {
    const fList = folders || [];
    const cMap = buildFolderColorMap(fList);

    if (!graphData) return { filteredGraph: null, colorMap: cMap };

    const aggregatedGraph = getAggregatedGraph(graphData, fList, activeFolderId);

    return { filteredGraph: aggregatedGraph, colorMap: cMap };
  }, [folders, graphData, activeFolderId]);

  return (
    <div className="flex-1 flex h-full w-full max-w-[1600px] mx-auto overflow-hidden">
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-surface-900/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar: Folder Tree */}
      <aside
        className={`fixed top-[88px] left-4 bottom-4 w-56 z-40 overflow-y-auto transition-transform duration-300 ${isMobileOpen ? 'translate-x-0' : '-translate-x-[150%]'} lg:translate-x-0 bg-white/70 backdrop-blur-2xl border border-surface-200/50 rounded-3xl shadow-sm custom-scrollbar`}
      >
        <div className="p-6 space-y-8 relative">
          <div>
            <h2 className="text-[10px] font-black text-surface-400 mb-6 tracking-[0.25em] uppercase">
              Core Database
            </h2>
            {isFoldersLoading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-4 bg-surface-200/50 rounded-full w-2/3" />
                <div className="h-4 bg-surface-200/50 rounded-full w-1/2" />
                <div className="h-4 bg-surface-200/50 rounded-full w-3/4" />
              </div>
            ) : (
              <VaultFolderTree
                folders={folders || []}
                activeFolderId={activeFolderId}
                onFolderSelect={setActiveFolderId}
              />
            )}
          </div>
        </div>
      </aside>

      {/* Main Graph View */}
      <main className="flex-1 relative p-4 sm:p-6 lg:p-8 min-h-[500px] lg:pl-[260px] w-full">
        {activeFolderId && (
          <div className="absolute top-8 left-8 lg:left-[292px] z-10">
            <button
              onClick={() => {
                const parent = folders?.find(f => f.id === activeFolderId)?.parent;
                setActiveFolderId(parent ?? null);
              }}
              className="px-4 py-2 rounded-full bg-white/80 border border-surface-200 text-surface-600 hover:text-surface-900 text-sm font-bold flex items-center gap-2 backdrop-blur-md shadow-sm transition-all hover:scale-105"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              <span>상위 폴더로</span>
            </button>
          </div>
        )}

        {isGraphLoading ? (
          <div className="w-full h-full flex items-center justify-center relative overflow-hidden rounded-[32px] border border-surface-200/50 bg-white/40 backdrop-blur-md">
            <div className="w-8 h-8 border-2 border-surface-300 border-t-surface-900 rounded-full animate-spin"></div>
          </div>
        ) : filteredGraph ? (
          <ClientVaultGraph
            graphData={filteredGraph}
            folderColorMap={colorMap}
            onFolderClick={setActiveFolderId}
          />
        ) : (
          <div className="text-surface-500">No Data</div>
        )}
      </main>

      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed bottom-6 right-6 z-50 p-4 rounded-full bg-surface-900 text-white shadow-xl hover:scale-105 active:scale-95 transition-all outline-none border border-white/10"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
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
