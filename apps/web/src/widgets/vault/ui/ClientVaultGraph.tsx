'use client';

import dynamic from 'next/dynamic';
import { GraphData } from '@/types/vault';

interface ClientVaultGraphProps {
  graphData: GraphData;
  activeNodeSlug?: string;
  onNodeClick?: (slug: string) => void;
  onFolderClick?: (folderId: string) => void;
  folderColorMap?: Record<string, string>;
  theme?: 'light' | 'dark' | 'system';
}

// SSR 비활성화하여 동적 import
export const ClientVaultGraph = dynamic(
  () => import('./VaultGraphView').then(mod => mod.VaultGraphView),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full relative overflow-hidden rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-surface-200 dark:border-surface-700 border-t-surface-900 dark:text-surface-100 rounded-full animate-spin"></div>
          <span className="text-surface-600 dark:text-surface-400 font-mono text-xs uppercase tracking-[0.3em] animate-pulse">
            Loading...
          </span>
        </div>
      </div>
    ),
  }
) as React.FC<ClientVaultGraphProps>;
