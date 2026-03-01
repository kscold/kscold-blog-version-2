'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useVaultNote, useVaultBacklinks, useVaultFolders, useVaultGraph } from '@/hooks/useVault';
import { VaultFolderTree } from '@/components/vault/VaultFolderTree';
import { VaultNoteContent } from '@/components/vault/VaultNoteContent';
import { BacklinkList } from '@/components/vault/BacklinkList';
import { ClientVaultGraph } from '@/components/vault/ClientVaultGraph';
import { buildFolderColorMap, getAggregatedGraph } from '@/lib/vault-utils';

export default function VaultNotePage() {
  const params = useParams();
  const slug = params.slug as string;

  const { data: note, isLoading: isNoteLoading, isError } = useVaultNote(slug);
  const { data: backlinks } = useVaultBacklinks(note?.id || '');
  const { data: folders, isLoading: isFoldersLoading } = useVaultFolders();
  const { data: graphData } = useVaultGraph();

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

      {/* Main Content Area */}
      <main className="flex-1 relative p-4 sm:p-6 lg:p-12 lg:pl-[260px] overflow-y-auto custom-scrollbar w-full">
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
            <VaultNoteContent note={note} />
            <BacklinkList backlinks={backlinks || []} />

            {/* Local Context Graph (Mini Graph View) */}
            <div className="mt-16 pt-8 border-t border-surface-200/50 h-[400px]">
              <h3 className="text-sm font-bold text-surface-400 uppercase tracking-widest mb-6 flex items-center gap-2">
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
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
                Synapse Map Insight
              </h3>
              {filteredGraph && (
                <ClientVaultGraph
                  graphData={filteredGraph}
                  activeNodeSlug={note.slug}
                  folderColorMap={colorMap}
                  onFolderClick={setActiveFolderId}
                />
              )}
            </div>
          </div>
        ) : null}
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
