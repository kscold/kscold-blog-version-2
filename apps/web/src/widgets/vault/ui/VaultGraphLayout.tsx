'use client';

import { useState, useEffect, useRef } from 'react';
import { useUiStore } from '@/shared/model/uiStore';
import { ClientVaultGraph } from '@/widgets/vault/ui/ClientVaultGraph';
import { VaultFolderTree } from '@/widgets/vault/ui/VaultFolderTree';
import { useVaultGraphData } from '@/features/vault/lib/useVaultGraph';

const MIN_SIDEBAR_WIDTH = 160;
const MAX_SIDEBAR_WIDTH = 480;
const DEFAULT_SIDEBAR_WIDTH = 224;

export function VaultGraphLayout() {
  const { theme } = useUiStore();
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_SIDEBAR_WIDTH);
  const [isDesktop, setIsDesktop] = useState(false);

  const isResizingRef = useRef(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(DEFAULT_SIDEBAR_WIDTH);

  const { folders, isFoldersLoading, isGraphLoading, filteredGraph, colorMap } =
    useVaultGraphData(activeFolderId);

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
          {activeFolderId && (
            <div className="lg:hidden">
              <button
                onClick={() => {
                  const parent = folders.find(f => f.id === activeFolderId)?.parent;
                  setActiveFolderId(parent ?? null);
                }}
                className="w-full px-4 py-2 rounded-full bg-surface-50/80 dark:bg-surface-900/80 border border-surface-200 dark:border-surface-800 text-surface-600 dark:text-surface-300 hover:text-surface-900 dark:hover:text-white text-sm font-bold flex items-center gap-2 backdrop-blur-xl shadow-sm transition-all hover:scale-105"
              >
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>상위 폴더로</span>
              </button>
            </div>
          )}
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
        className="flex-1 relative w-full h-full"
        style={isDesktop ? { paddingLeft: `${sidebarWidth + 36}px` } : undefined}
      >
        {activeFolderId && (
          <div className="absolute top-4 left-4 z-10 hidden lg:block">
            <button
              onClick={() => {
                const parent = folders.find(f => f.id === activeFolderId)?.parent;
                setActiveFolderId(parent ?? null);
              }}
              className="px-4 py-2 rounded-full bg-surface-50/80 dark:bg-surface-900/80 border border-surface-200 dark:border-surface-800 text-surface-600 dark:text-surface-300 hover:text-surface-900 dark:hover:text-white text-sm font-bold flex items-center gap-2 backdrop-blur-xl shadow-sm transition-all hover:scale-105"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>상위 폴더로</span>
            </button>
          </div>
        )}

        {(isGraphLoading || isFoldersLoading) ? (
          <div className="w-full h-full flex items-center justify-center relative overflow-hidden bg-surface-50/50 dark:bg-surface-950/50 backdrop-blur-md">
            <div className="w-8 h-8 border-2 border-surface-300 dark:border-surface-700 border-t-surface-900 dark:border-t-white rounded-full animate-spin" />
          </div>
        ) : filteredGraph ? (
          <div className="w-full h-full">
            <ClientVaultGraph
              graphData={filteredGraph}
              folderColorMap={colorMap}
              onFolderClick={setActiveFolderId}
              theme={theme}
            />
          </div>
        ) : (
          <div className="text-surface-500 w-full h-full flex items-center justify-center">No Data</div>
        )}
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
