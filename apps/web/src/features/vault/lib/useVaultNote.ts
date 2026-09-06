import { useMemo } from 'react';
import {
  useVaultBacklinks,
  useVaultFolders,
  useVaultGraph,
  useVaultNote as useVaultNoteQuery,
  useVaultTitleIndex,
} from '@/entities/vault';
import { buildFolderColorMap, buildVaultTitleSlugMap, getLocalGraph } from '@/entities/vault';
import type { VaultNote } from '@/shared/model/types/vault';

interface UseVaultNoteDataOptions {
  initialNote?: VaultNote;
  initialTitleSlugMap?: Record<string, string>;
  shouldLoadGraph?: boolean;
}

export function useVaultNoteData(slug: string, options: UseVaultNoteDataOptions = {}) {
  const { initialNote, initialTitleSlugMap = {}, shouldLoadGraph = false } = options;
  const { data: note, isLoading: isNoteLoading, isError } = useVaultNoteQuery(slug, initialNote);
  const { data: backlinks } = useVaultBacklinks(note?.id || '');
  const { data: folders, isLoading: isFoldersLoading } = useVaultFolders();
  const { data: graphData } = useVaultGraph(shouldLoadGraph);
  const { data: titleIndex } = useVaultTitleIndex();

  const { localGraph, colorMap, titleSlugMap } = useMemo(() => {
    const fList = folders || [];
    const cMap = buildFolderColorMap(fList);
    // 첫 렌더는 서버가 선별한 매핑을 사용하고 조회가 끝나면 전체 최신 인덱스로 교체한다.
    const tsMap = titleIndex ? buildVaultTitleSlugMap(titleIndex) : initialTitleSlugMap;
    if (!graphData || !note) return { localGraph: null, colorMap: cMap, titleSlugMap: tsMap };
    const graph = getLocalGraph(graphData, note, backlinks || []);
    return { localGraph: graph, colorMap: cMap, titleSlugMap: tsMap };
  }, [folders, graphData, note, backlinks, titleIndex, initialTitleSlugMap]);

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
