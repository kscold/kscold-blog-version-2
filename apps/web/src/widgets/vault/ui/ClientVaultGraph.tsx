'use client';

import { useHydrated } from '@/shared/lib/useBrowserSnapshot';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { GraphData } from '@/shared/model/types/vault';
import { GraphPanelSkeleton } from '@/shared/ui/RouteSkeletons';

interface ClientVaultGraphProps {
  graphData: GraphData;
  activeNodeSlug?: string;
  onNodeClick?: (slug: string) => void;
  onFolderClick?: (folderId: string) => void;
  folderColorMap?: Record<string, string>;
  theme?: 'light' | 'dark' | 'system';
  highlightFolderId?: string | null;
  deferUntilVisible?: boolean;
}

type LoadedVaultGraphProps = Omit<ClientVaultGraphProps, 'deferUntilVisible'>;

// 캔버스와 force simulation은 브라우저에서만 실행한다.
const LoadedVaultGraph = dynamic(
  () => import('./VaultGraphView').then(mod => mod.VaultGraphView),
  {
    ssr: false,
    loading: () => <GraphPanelSkeleton />,
  }
) as React.FC<LoadedVaultGraphProps>;

function DeferredVaultGraph(props: LoadedVaultGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [observed, setIsNearViewport] = useState(false);
  const hydrated = useHydrated();
  const isNearViewport = observed || (hydrated && typeof IntersectionObserver === 'undefined');

  useEffect(() => {
    const container = containerRef.current;
    if (!container || isNearViewport) {
      return;
    }

    if (!('IntersectionObserver' in window)) {
      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          setIsNearViewport(true);
          observer.disconnect();
        }
      },
      { rootMargin: '240px 0px' }
    );
    observer.observe(container);
    return () => observer.disconnect();
  }, [isNearViewport]);

  return (
    <div ref={containerRef} className="h-full min-h-[240px]">
      {isNearViewport ? <LoadedVaultGraph {...props} /> : <GraphPanelSkeleton />}
    </div>
  );
}

export function ClientVaultGraph({ deferUntilVisible = false, ...props }: ClientVaultGraphProps) {
  return deferUntilVisible ? <DeferredVaultGraph {...props} /> : <LoadedVaultGraph {...props} />;
}
