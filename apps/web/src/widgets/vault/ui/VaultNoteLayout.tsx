'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useUiStore } from '@/shared/model/uiStore';
import { useVaultNoteData } from '@/features/vault/lib/useVaultNote';
import { VaultFolderTree } from '@/widgets/vault/ui/VaultFolderTree';
import { VaultNoteContent } from '@/entities/vault/ui/VaultNoteContent';
import { BacklinkList } from '@/entities/vault/ui/BacklinkList';
import { ClientVaultGraph } from '@/widgets/vault/ui/ClientVaultGraph';

const MIN_SIDEBAR_WIDTH = 160;
const MAX_SIDEBAR_WIDTH = 480;
const DEFAULT_SIDEBAR_WIDTH = 224;

export function VaultNoteLayout() {
  const params = useParams();
  const slug = params.slug as string;
  const { theme } = useUiStore();

  const { note, backlinks, folders, isNoteLoading, isFoldersLoading, isError, localGraph, colorMap } =
    useVaultNoteData(slug);

  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_SIDEBAR_WIDTH);
  const [isDesktop, setIsDesktop] = useState(false);

  const isResizingRef = useRef(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(DEFAULT_SIDEBAR_WIDTH);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isResizingRef.current) return;
      const delta = e.clientX - startXRef.current;
      const newWidth = Math.min(MAX_SIDEBAR_WIDTH, Math.max(MIN_SIDEBAR_WIDTH, startWidthRef.current + delta));
      setSidebarWidth(newWidth);
    };

    const onMouseUp = () => {
      isResizingRef.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  const handleResizeStart = (e: React.MouseEvent) => {
    isResizingRef.current = true;
    startXRef.current = e.clientX;
    startWidthRef.current = sidebarWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

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
    <div className="absolute inset-0 flex overflow-hidden bg-transparent">
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-surface-900/20 backdrop-blur-sm z-[45] lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`absolute lg:fixed top-0 lg:top-16 left-0 lg:left-4 bottom-0 lg:bottom-4 w-64 z-50 lg:z-40 overflow-y-auto transition-transform duration-300 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} bg-white/90 dark:bg-surface-900/90 backdrop-blur-3xl border-r lg:border border-surface-200/50 dark:border-surface-800 lg:rounded-3xl shadow-2xl lg:shadow-sm custom-scrollbar h-full lg:h-[calc(100dvh-5rem)]`}
        style={isDesktop ? { width: `${sidebarWidth}px` } : undefined}
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
                folders={folders}
                activeFolderId={activeFolderId}
                onFolderSelect={setActiveFolderId}
              />
            )}
          </div>
        </div>

        <div
          className="hidden lg:block absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-surface-300/50 dark:hover:bg-surface-600/50 transition-colors rounded-r-3xl"
          onMouseDown={handleResizeStart}
        />
      </aside>

      <main
        className="flex-1 relative p-4 sm:p-6 lg:p-12 overflow-y-auto custom-scrollbar w-full h-full"
        style={isDesktop ? { paddingLeft: `${sidebarWidth + 36}px` } : undefined}
      >
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
            <VaultNoteContent note={note} theme={theme} />
            <BacklinkList backlinks={backlinks} />

            <div className="mt-16 pt-8 border-t border-surface-200/50 h-[400px]">
              <h3 className="text-sm font-bold text-surface-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
                Synapse Map Insight
              </h3>
              {localGraph && (
                <ClientVaultGraph
                  graphData={localGraph}
                  activeNodeSlug={note.slug}
                  folderColorMap={colorMap}
                  onFolderClick={setActiveFolderId}
                  theme={theme}
                />
              )}
            </div>
          </div>
        ) : null}
      </main>

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
