'use client';

import dynamic from 'next/dynamic';
import { GraphData } from '@/types/vault';
import { GraphPanelSkeleton } from '@/shared/ui/RouteSkeletons';

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
    loading: () => <GraphPanelSkeleton />,
  }
) as React.FC<ClientVaultGraphProps>;
