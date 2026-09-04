import { useMemo } from 'react';
import {
  useVaultBacklinks,
  useVaultFolders,
  useVaultGraph,
  useVaultNote as useVaultNoteQuery,
  useVaultTitleIndex,
} from '@/entities/vault';
import { buildFolderColorMap, getLocalGraph } from '@/entities/vault';
import type { VaultNote } from '@/shared/model/types/vault';

export function useVaultNoteData(
  slug: string,
  initialNote?: VaultNote,
  shouldLoadGraph = false
) {
  const { data: note, isLoading: isNoteLoading, isError } = useVaultNoteQuery(slug, initialNote);
  const { data: backlinks } = useVaultBacklinks(note?.id || '');
  const { data: folders, isLoading: isFoldersLoading } = useVaultFolders();
  const { data: graphData } = useVaultGraph(shouldLoadGraph);
  const { data: titleIndex } = useVaultTitleIndex();

  const { localGraph, colorMap, titleSlugMap } = useMemo(() => {
    const fList = folders || [];
    const cMap = buildFolderColorMap(fList);
    // 노트 title → slug 매핑 구축 (wiki-link 변환용)
    const tsMap: Record<string, string> = {};
    if (titleIndex) {
      for (const item of titleIndex) {
        if (item.name && item.slug) {
          tsMap[item.name] = item.slug;
        }
      }
    }
    if (!graphData || !note) return { localGraph: null, colorMap: cMap, titleSlugMap: tsMap };
    const graph = getLocalGraph(graphData, note, backlinks || []);
    return { localGraph: graph, colorMap: cMap, titleSlugMap: tsMap };
  }, [folders, graphData, note, backlinks, titleIndex]);

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
