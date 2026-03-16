import { useMemo } from 'react';
import { useVaultNote as useVaultNoteQuery, useVaultBacklinks, useVaultFolders, useVaultGraph } from '@/entities/vault/api/useVault';
import { buildFolderColorMap, getLocalGraph } from '@/entities/vault/lib/vault-utils';

export function useVaultNoteData(slug: string) {
  const { data: note, isLoading: isNoteLoading, isError } = useVaultNoteQuery(slug);
  const { data: backlinks } = useVaultBacklinks(note?.id || '');
  const { data: folders, isLoading: isFoldersLoading } = useVaultFolders();
  const { data: graphData } = useVaultGraph();

  const { localGraph, colorMap, titleSlugMap } = useMemo(() => {
    const fList = folders || [];
    const cMap = buildFolderColorMap(fList);
    // 노트 title → slug 매핑 구축 (wiki-link 변환용)
    const tsMap: Record<string, string> = {};
    if (graphData?.nodes) {
      for (const node of graphData.nodes) {
        if (node.name && node.slug && !node.isFolder) {
          tsMap[node.name] = node.slug;
        }
      }
    }
    if (!graphData || !note) return { localGraph: null, colorMap: cMap, titleSlugMap: tsMap };
    const graph = getLocalGraph(graphData, note, backlinks || []);
    return { localGraph: graph, colorMap: cMap, titleSlugMap: tsMap };
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
    titleSlugMap,
  };
}
