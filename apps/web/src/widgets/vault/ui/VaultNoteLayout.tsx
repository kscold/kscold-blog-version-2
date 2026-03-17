'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUiStore } from '@/shared/model/uiStore';
import { useVaultNoteData } from '@/features/vault/lib/useVaultNote';
import { VaultFolderTree } from '@/widgets/vault/ui/VaultFolderTree';
import { VaultNoteContent } from '@/entities/vault/ui/VaultNoteContent';
import { BacklinkList } from '@/entities/vault/ui/BacklinkList';
import { ClientVaultGraph } from '@/widgets/vault/ui/ClientVaultGraph';

const MIN_SIDEBAR_WIDTH = 200;
const MAX_SIDEBAR_WIDTH = 560;
const DEFAULT_SIDEBAR_WIDTH = 320;

export function VaultNoteLayout() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { theme } = useUiStore();

  const { note, backlinks, folders, isNoteLoading, isFoldersLoading, isError, localGraph, colorMap, titleSlugMap } =
    useVaultNoteData(slug);

  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // 폴더 클릭 시 그래프 페이지로 이동
  const handleFolderSelect = (folderId: string | null) => {
    if (folderId) {
      router.push(`/vault?folder=${folderId}`);
    } else {
      router.push('/vault');
    }
  };
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
    <div className="absolute inset-0 flex overflow-hidden bg-transparent lg:p-4 lg:gap-4">
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-surface-900/20 backdrop-blur-sm z-[45] lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:relative top-0 lg:top-0 left-0 z-50 lg:z-10 overflow-y-auto transition-transform duration-300 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} bg-white/90 dark:bg-surface-900/90 backdrop-blur-3xl border-r lg:border border-surface-200/50 dark:border-surface-800 lg:rounded-3xl shadow-2xl lg:shadow-sm custom-scrollbar w-80 h-full shrink-0 flex flex-col`}
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
                onFolderSelect={handleFolderSelect}
              />
            )}
          </div>
        </div>

        <div
          className="hidden lg:block absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-surface-300/50 dark:hover:bg-surface-600/50 transition-colors rounded-r-3xl"
          onMouseDown={handleResizeStart}
        />
      </aside>

      <main className="flex-1 relative p-4 sm:p-6 lg:p-12 overflow-y-auto custom-scrollbar w-full h-full min-w-0 lg:rounded-3xl bg-white/40 dark:bg-surface-950/40 backdrop-blur-md lg:shadow-sm border-0 lg:border border-surface-200/50 dark:border-surface-800/50">
        <div className="sticky top-0 z-10 -mx-4 sm:-mx-6 lg:-mx-12 -mt-4 sm:-mt-6 lg:-mt-12 px-4 lg:px-4 py-4 mb-2">
          <button
            onClick={() => {
              if (note?.folderId) {
                router.push(`/vault?folder=${note.folderId}`);
              } else {
                router.push('/vault');
              }
            }}
            className="px-4 py-2 rounded-full bg-surface-50/80 dark:bg-surface-900/80 border border-surface-200 dark:border-surface-800 text-surface-600 dark:text-surface-300 hover:text-surface-900 dark:hover:text-white text-sm font-bold flex items-center gap-2 backdrop-blur-xl shadow-sm transition-all hover:scale-105"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>상위 폴더로</span>
          </button>
        </div>
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
            <VaultNoteContent note={note} theme={theme} titleSlugMap={titleSlugMap} />
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
