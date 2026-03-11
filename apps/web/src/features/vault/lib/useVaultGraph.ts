import { useMemo } from 'react';
import { useVaultFolders, useVaultGraph as useVaultGraphQuery } from '@/entities/vault/api/useVault';
import { buildFolderColorMap, getAggregatedGraph } from '@/entities/vault/lib/vault-utils';

export function useVaultGraphData(activeFolderId: string | null) {
  const { data: folders, isLoading: isFoldersLoading } = useVaultFolders();
  const { data: graphData, isLoading: isGraphLoading } = useVaultGraphQuery();

  const { filteredGraph, colorMap } = useMemo(() => {
    const fList = folders || [];
    const cMap = buildFolderColorMap(fList);
    if (!graphData) return { filteredGraph: null, colorMap: cMap };
    const aggregatedGraph = getAggregatedGraph(graphData, fList, activeFolderId);
    return { filteredGraph: aggregatedGraph, colorMap: cMap };
  }, [folders, graphData, activeFolderId]);

  return {
    folders: folders || [],
    isFoldersLoading,
    isGraphLoading,
    filteredGraph,
    colorMap,
  };
}
