'use client';

import dynamic from 'next/dynamic';
import { GraphData } from '@/types/api';

interface ClientVaultGraphProps {
  graphData: any; // Using any for now since getAggregatedGraph returns aggregated nodes
  activeNodeSlug?: string;
  onNodeClick?: (slug: string) => void;
  onFolderClick?: (folderId: string) => void;
  folderColorMap?: Record<string, string>;
}

// Dynamically import the ForceGraph component with SSR disabled
export const ClientVaultGraph = dynamic(
  () => import('./VaultGraphView').then(mod => mod.VaultGraphView),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full relative overflow-hidden rounded-[32px] border border-white/5 bg-[#020617] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-accent-light/20 border-t-accent-light rounded-full animate-spin"></div>
          <span className="text-surface-500 font-mono text-xs uppercase tracking-[0.3em] animate-pulse">
            Initializing Synapse Link...
          </span>
        </div>
      </div>
    ),
  }
) as React.FC<ClientVaultGraphProps>;
