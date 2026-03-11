import { useMemo } from 'react';
import { useVaultNote as useVaultNoteQuery, useVaultBacklinks, useVaultFolders, useVaultGraph } from '@/entities/vault/api/useVault';
import { buildFolderColorMap, getLocalGraph } from '@/entities/vault/lib/vault-utils';

export function useVaultNoteData(slug: string) {
  const { data: note, isLoading: isNoteLoading, isError } = useVaultNoteQuery(slug);
  const { data: backlinks } = useVaultBacklinks(note?.id || '');
  const { data: folders, isLoading: isFoldersLoading } = useVaultFolders();
  const { data: graphData } = useVaultGraph();

  const { localGraph, colorMap } = useMemo(() => {
    const fList = folders || [];
    const cMap = buildFolderColorMap(fList);
    if (!graphData || !note) return { localGraph: null, colorMap: cMap };
    const graph = getLocalGraph(graphData, note, backlinks || []);
    return { localGraph: graph, colorMap: cMap };
  }, [folders, graphData, note, backlinks]);

  return {
    note,
    backlinks: backlinks || [],
    folders: folders || [],
    isNoteLoading,
    isFoldersLoading,
    isError,
    localGraph,
    colorMap,
  };
}
