import { VaultFolder, VaultNote, GraphData, GraphNode, GraphLink } from '@/types/vault';

const CATEGORY_COLORS = [
  '#64C8FF', // 하늘색
  '#A855F7', // 보라색
  '#F43F5E', // 로즈
  '#10B981', // 에메랄드
  '#F59E0B', // 황색
  '#3B82F6', // 파란색
];

// 폴더 ID → 루트 색상 매핑 테이블
export function buildFolderColorMap(folders: VaultFolder[]): Record<string, string> {
  const map: Record<string, string> = {};

  // 루트 폴더 탐색
  const roots = folders.filter(f => !f.parent);

  // 루트에 색상 할당 후 자식 폴더에 재귀적으로 동일 색상 적용
  roots.forEach((root, idx) => {
    const color = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];

    const assignColor = (f: VaultFolder) => {
      map[f.id] = color;
      if (f.children) {
        f.children.forEach(assignColor);
      }
    };

    assignColor(root);
  });

  return map;
}

// 특정 폴더의 모든 하위 폴더 ID 반환
export function getSubfolderIds(folders: VaultFolder[], targetId: string): string[] {
  let ids: string[] = [];

  const search = (fList: VaultFolder[], inTarget: boolean) => {
    for (const f of fList) {
      if (f.id === targetId || inTarget) {
        ids.push(f.id);
        if (f.children) search(f.children, true);
      } else if (f.children) {
        search(f.children, false);
      }
    }
  };

  search(folders, false);
  return ids;
}

/**
 * Build a local graph centered on the current note,
 * showing only directly connected nodes (outgoing links + backlinks).
 */
export function getLocalGraph(
  rawGraph: GraphData,
  currentNote: VaultNote,
  backlinks: VaultNote[]
): { nodes: GraphNode[]; links: GraphLink[] } {
  if (!rawGraph || !currentNote) return { nodes: [], links: [] };

  // 연결된 모든 노트 ID 수집
  const connectedIds = new Set<string>();
  connectedIds.add(currentNote.id);

  // 아웃고잉 링크 (현재 노트가 참조하는 노트 ID)
  for (const linkId of currentNote.outgoingLinks || []) {
    connectedIds.add(linkId);
  }

  // 백링크 (현재 노트를 참조하는 노트)
  for (const bl of backlinks || []) {
    connectedIds.add(bl.id);
  }

  // 연결된 노드만 필터링
  const localNodes = rawGraph.nodes
    .filter(n => connectedIds.has(n.id))
    .map(n => ({
      ...n,
      val: n.id === currentNote.id ? 8 : (n.size || 1),
      isFolder: false,
      isCenter: n.id === currentNote.id,
    }));

  // 링크 필터링: source·target 모두 로컬 집합에 포함된 경우만
  const localLinks = rawGraph.links.filter(l => {
    const srcId = typeof l.source === 'object' ? (l.source as GraphNode).id : l.source;
    const tgtId = typeof l.target === 'object' ? (l.target as GraphNode).id : l.target;
    return connectedIds.has(srcId) && connectedIds.has(tgtId);
  });

  return { nodes: localNodes, links: localLinks };
}

export function getAggregatedGraph(
  rawGraph: GraphData,
  folders: VaultFolder[],
  activeFolderId: string | null
): { nodes: GraphNode[]; links: GraphLink[] } {
  if (!rawGraph) return { nodes: [], links: [] };

  const directSubfolders =
    activeFolderId === null
      ? folders.filter(f => !f.parent)
      : folders.find(f => f.id === activeFolderId)?.children || [];

  const nodeMapping = new Map<string, string>();
  const aggregatedNodes: GraphNode[] = [];

  // 하위 폴더 매핑
  for (const subfolder of directSubfolders) {
    const descendantIds = getSubfolderIds(folders, subfolder.id);
    const notesInside = rawGraph.nodes.filter(
      n => n.folderId && descendantIds.includes(n.folderId)
    );

    for (const node of notesInside) {
      nodeMapping.set(node.id, subfolder.id);
    }

    const hasChildren = subfolder.children && subfolder.children.length > 0;

    // 노트가 있거나 자식 서브폴더가 있을 때만 폴더 노드 표시
    if (notesInside.length > 0 || hasChildren) {
      aggregatedNodes.push({
        id: subfolder.id,
        name: subfolder.name,
        slug: '',
        size: 0,
        val: Math.max(10, notesInside.length * 2 + (hasChildren ? 5 : 0)),
        folderId: subfolder.id,
        isFolder: true,
      });
    }
  }

  // 직접 소속 노트 매핑
  for (const node of rawGraph.nodes) {
    if ((node.folderId || null) === activeFolderId) {
      nodeMapping.set(node.id, node.id);
      aggregatedNodes.push({
        ...node,
        val: node.size || 1,
        isFolder: false,
      });
    }
  }

  // 링크 집계
  const aggregatedLinks: GraphLink[] = [];
  const linkSet = new Set<string>();

  for (const link of rawGraph.links) {
    const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
    const targetId = typeof link.target === 'object' ? link.target.id : link.target;

    const aggSource = nodeMapping.get(sourceId);
    const aggTarget = nodeMapping.get(targetId);

    if (aggSource && aggTarget && aggSource !== aggTarget) {
      const linkKey = `${aggSource}->${aggTarget}`;
      if (!linkSet.has(linkKey)) {
        linkSet.add(linkKey);
        aggregatedLinks.push({
          source: aggSource,
          target: aggTarget,
        });
      }
    }
  }

  return {
    nodes: aggregatedNodes,
    links: aggregatedLinks,
  };
}
