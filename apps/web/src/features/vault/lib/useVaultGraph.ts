import { useMemo } from 'react';
import { useVaultFolders, useVaultGraph as useVaultGraphQuery } from '@/entities/vault';
import { buildFolderColorMap, filterPopulatedFolders, getAggregatedGraph } from '@/entities/vault';

export function useVaultGraphData(activeFolderId: string | null) {
  const { data: folders, isLoading: isFoldersLoading } = useVaultFolders();
  const { data: graphData, isLoading: isGraphLoading, isError: isGraphError, error: graphError } = useVaultGraphQuery();

  const { filteredGraph, colorMap, visibleFolders } = useMemo(() => {
    const fList = folders || [];
    if (!graphData) {
      return {
        filteredGraph: null,
        colorMap: buildFolderColorMap(fList),
        visibleFolders: fList,
      };
    }

    const populatedFolders = filterPopulatedFolders(fList, graphData.nodes);
    const cMap = buildFolderColorMap(populatedFolders);
    const aggregatedGraph = getAggregatedGraph(graphData, populatedFolders, activeFolderId);
    return { filteredGraph: aggregatedGraph, colorMap: cMap, visibleFolders: populatedFolders };
  }, [folders, graphData, activeFolderId]);

  return {
    folders: visibleFolders,
    isFoldersLoading,
    isGraphLoading,
    isGraphError,
    graphError,
    filteredGraph,
    colorMap,
  };
}
