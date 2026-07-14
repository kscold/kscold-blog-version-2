'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useUiStore } from '@/shared/model/uiStore';
import { usePerformanceMode } from '@/shared/model/usePerformanceMode';
import { ClientVaultGraph } from './ClientVaultGraph';
import { VaultFolderTree } from './VaultFolderTree';
import { useVaultGraphData } from '@/features/vault';
import { GraphPanelSkeleton } from '@/shared/ui/RouteSkeletons';

const MIN_SIDEBAR_WIDTH = 200;
const MAX_SIDEBAR_WIDTH = 560;
const DEFAULT_SIDEBAR_WIDTH = 320;

export function VaultGraphLayout() {
  const { theme } = useUiStore();
  const { isTouchDevice } = usePerformanceMode();
  const searchParams = useSearchParams();
  const initialFolder = searchParams.get('folder');
  const [activeFolderId, setActiveFolderId] = useState<string | null>(initialFolder);
  const [hoverFolderId, setHoverFolderId] = useState<string | null>(null);
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
    <div className="absolute inset-0 flex overflow-hidden bg-transparent lg:p-4 lg:gap-4">
      {isMobileOpen && (
        <div
          className={`fixed inset-0 z-[45] lg:hidden ${isTouchDevice ? 'bg-surface-900/25' : 'bg-surface-900/20 backdrop-blur-sm'}`}
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:relative top-0 lg:top-0 left-0 z-50 lg:z-10 overflow-y-auto transition-transform duration-300 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} ${isTouchDevice ? 'bg-white dark:bg-surface-900 border-r border-surface-200 dark:border-surface-800 shadow-xl' : 'bg-white/90 dark:bg-surface-900/90 backdrop-blur-3xl border-r lg:border border-surface-200/50 dark:border-surface-800 shadow-2xl lg:shadow-sm'} lg:rounded-3xl custom-scrollbar w-80 h-full shrink-0 flex flex-col`}
        style={isDesktop ? { width: `${sidebarWidth}px` } : undefined}
      >
        <div className="p-6 flex-1 space-y-8 relative">
          {activeFolderId && (
            <div className="lg:hidden">
              <button
                onClick={() => {
                  const parent = folders.find(f => f.id === activeFolderId)?.parent;
                  setActiveFolderId(parent ?? null);
                }}
                className={`w-full px-4 py-2 rounded-full border text-surface-600 dark:text-surface-300 hover:text-surface-900 dark:hover:text-white text-sm font-bold flex items-center gap-2 shadow-sm transition-all ${isTouchDevice ? 'bg-white dark:bg-surface-900 border-surface-200 dark:border-surface-800' : 'bg-surface-50/80 dark:bg-surface-900/80 border-surface-200 dark:border-surface-800 backdrop-blur-xl hover:scale-105'}`}
              >
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>상위 폴더로</span>
              </button>
            </div>
          )}
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-[10px] font-black text-surface-400 tracking-[0.25em] uppercase">
                Core Database
              </h2>
              <button
                onClick={() => setIsMobileOpen(false)}
                aria-label="폴더 닫기"
                className="lg:hidden flex h-8 w-8 items-center justify-center rounded-lg text-surface-400 transition hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-white"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
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
                onFolderSelect={id => {
                  setActiveFolderId(id);
                  if (!isDesktop) setIsMobileOpen(false);
                }}
                onFolderHover={isTouchDevice ? undefined : setHoverFolderId}
              />
            )}
          </div>
        </div>

        <div
          className="hidden lg:block absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-surface-300/50 dark:hover:bg-surface-600/50 transition-colors rounded-r-3xl"
          onMouseDown={handleResizeStart}
        />
      </aside>

      <main className="flex-1 relative w-full h-full min-w-0 flex flex-col">
        {/* 모바일 상단 툴바 — 폴더 이동·현재 폴더·통계 (좌하단 FAB 대체, 상단 공백 활용) */}
        <div className="lg:hidden flex items-center gap-2 px-3 pt-2 pb-1">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-surface-200 dark:border-surface-800 bg-white/90 dark:bg-surface-900/90 px-3 py-1.5 text-xs font-bold text-surface-700 dark:text-surface-200 shadow-sm backdrop-blur-xl transition active:scale-95"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a2 2 0 012-2h3.6a2 2 0 011.4.6L12 7h5a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
            </svg>
            폴더
          </button>
          {activeFolderId && (
            <button
              onClick={() =>
                setActiveFolderId(folders.find(f => f.id === activeFolderId)?.parent ?? null)
              }
              className="flex shrink-0 items-center gap-1 rounded-full border border-surface-200 dark:border-surface-800 bg-white/90 dark:bg-surface-900/90 px-2.5 py-1.5 text-xs font-bold text-surface-500 shadow-sm backdrop-blur-xl transition active:scale-95"
              aria-label="상위 폴더로"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
          )}
          <span className="min-w-0 flex-1 truncate text-sm font-bold text-surface-800 dark:text-surface-100">
            {activeFolderId ? (folders.find(f => f.id === activeFolderId)?.name ?? '폴더') : '전체'}
          </span>
          <span className="shrink-0 font-mono text-[10px] tracking-wider text-surface-400">
            {filteredGraph?.nodes.length ?? 0}·{filteredGraph?.links.length ?? 0}
          </span>
        </div>

        {activeFolderId && (
          <div className="absolute top-4 left-4 z-10 hidden lg:block">
            <button
              onClick={() => {
                const parent = folders.find(f => f.id === activeFolderId)?.parent;
                setActiveFolderId(parent ?? null);
              }}
              className={`px-4 py-2 rounded-full border text-surface-600 dark:text-surface-300 hover:text-surface-900 dark:hover:text-white text-sm font-bold flex items-center gap-2 shadow-sm transition-all ${isTouchDevice ? 'bg-white dark:bg-surface-900 border-surface-200 dark:border-surface-800' : 'bg-surface-50/80 dark:bg-surface-900/80 border-surface-200 dark:border-surface-800 backdrop-blur-xl hover:scale-105'}`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>상위 폴더로</span>
            </button>
          </div>
        )}

        <div className="relative min-h-0 flex-1">
          {(isGraphLoading || isFoldersLoading) ? (
            <GraphPanelSkeleton />
          ) : filteredGraph ? (
            <div className={`w-full h-full flex flex-col overflow-hidden lg:rounded-3xl border-0 lg:border ${isTouchDevice ? 'bg-white dark:bg-surface-950 lg:shadow-sm border-surface-200 dark:border-surface-800' : 'bg-white/40 dark:bg-surface-950/40 backdrop-blur-md lg:shadow-sm border-surface-200/50 dark:border-surface-800/50'}`}>
              <ClientVaultGraph
                graphData={filteredGraph}
                folderColorMap={colorMap}
                onFolderClick={setActiveFolderId}
                theme={theme}
                highlightFolderId={hoverFolderId}
              />
            </div>
          ) : (
            <div className={`text-surface-500 w-full h-full flex flex-col items-center justify-center lg:rounded-3xl border-0 lg:border ${isTouchDevice ? 'bg-white dark:bg-surface-950 border-surface-200 dark:border-surface-800' : 'bg-white/40 dark:bg-surface-950/40 backdrop-blur-md border-surface-200/50 dark:border-surface-800/50'}`}>No Data</div>
          )}
        </div>
      </main>
    </div>
  );
}
