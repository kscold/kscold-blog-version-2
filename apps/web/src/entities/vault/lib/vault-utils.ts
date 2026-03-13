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

// 중첩 트리에서 ID로 폴더 찾기
export function findFolderById(folders: VaultFolder[], id: string): VaultFolder | null {
  for (const f of folders) {
    if (f.id === id) return f;
    if (f.children) {
      const found = findFolderById(f.children, id);
      if (found) return found;
    }
  }
  return null;
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

  const aggregatedNodes: GraphNode[] = [];
  const aggregatedLinks: GraphLink[] = [];

  if (activeFolderId === null) {
    // ── 루트 뷰: 루트 폴더 + 바로 아래 자식 폴더까지 2레벨 표시 ──
    const rootFolders = folders.filter(f => !f.parent);

    for (const root of rootFolders) {
      const rootDescendantIds = getSubfolderIds(folders, root.id);
      const notesInRoot = rawGraph.nodes.filter(
        n => n.folderId && rootDescendantIds.includes(n.folderId)
      );
      if (notesInRoot.length === 0 && !(root.children && root.children.length > 0)) continue;

      aggregatedNodes.push({
        id: root.id,
        name: root.name,
        slug: '',
        size: 0,
        val: Math.min(50, Math.max(12, Math.log(notesInRoot.length + 1) * 8 + 5)),
        folderId: root.id,
        isFolder: true,
      });

      // 직속 자식 폴더도 노드로 추가 + 루트→자식 링크 생성
      for (const child of root.children || []) {
        const childDescendantIds = getSubfolderIds(folders, child.id);
        const notesInChild = rawGraph.nodes.filter(
          n => n.folderId && childDescendantIds.includes(n.folderId)
        );
        if (notesInChild.length === 0 && !(child.children && child.children.length > 0)) continue;

        aggregatedNodes.push({
          id: child.id,
          name: child.name,
          slug: '',
          size: 0,
          val: Math.min(35, Math.max(8, Math.log(notesInChild.length + 1) * 6 + 3)),
          folderId: root.id, // 부모 색상 상속
          isFolder: true,
        });

        aggregatedLinks.push({ source: root.id, target: child.id });
      }
    }

    return { nodes: aggregatedNodes, links: aggregatedLinks };
  }

  // ── 폴더 뷰: 허브 + 자식 폴더 + 직접 노트 (Obsidian 스타일) ──────
  const currentFolder = findFolderById(folders, activeFolderId);
  const directChildren = currentFolder?.children || [];

  // 현재 폴더를 중앙 허브로 추가
  if (currentFolder) {
    const allDescendantIds = getSubfolderIds(folders, activeFolderId);
    const totalNotes = rawGraph.nodes.filter(
      n => n.folderId && allDescendantIds.includes(n.folderId)
    ).length;
    aggregatedNodes.push({
      id: activeFolderId,
      name: currentFolder.name,
      slug: '',
      size: 0,
      val: Math.min(50, Math.max(20, Math.log(totalNotes + 1) * 7 + 5)),
      folderId: activeFolderId,
      isFolder: true,
    });
  }

  const addedNodeIds = new Set<string>([activeFolderId]);

  // 직속 자식 폴더 → 허브에 연결
  for (const child of directChildren) {
    const childDescIds = getSubfolderIds(folders, child.id);
    const notesInChild = rawGraph.nodes.filter(
      n => n.folderId && childDescIds.includes(n.folderId)
    );
    if (notesInChild.length === 0 && !(child.children && child.children.length > 0)) continue;

    aggregatedNodes.push({
      id: child.id,
      name: child.name,
      slug: '',
      size: 0,
      val: Math.min(30, Math.max(10, Math.log(notesInChild.length + 1) * 5 + 3)),
      folderId: activeFolderId,
      isFolder: true,
    });
    addedNodeIds.add(child.id);
    aggregatedLinks.push({ source: activeFolderId, target: child.id });

    // 자식 폴더의 노트들 → 자식 폴더에 연결 (최대 30개 per subfolder, 성능)
    const sample = notesInChild.slice(0, 30);
    for (const note of sample) {
      aggregatedNodes.push({ ...note, val: Math.max(4, (note.size || 1) + 3), isFolder: false });
      addedNodeIds.add(note.id);
      aggregatedLinks.push({ source: child.id, target: note.id });
    }
  }

  // 현재 폴더에 직접 소속된 노트 → 허브에 연결
  const directNotes = rawGraph.nodes.filter(n => n.folderId === activeFolderId);
  for (const note of directNotes.slice(0, 50)) {
    if (!addedNodeIds.has(note.id)) {
      aggregatedNodes.push({ ...note, val: Math.max(4, (note.size || 1) + 3), isFolder: false });
      addedNodeIds.add(note.id);
      aggregatedLinks.push({ source: activeFolderId, target: note.id });
    }
  }

  // note→note 실제 링크 추가 (API에 있을 경우)
  for (const link of rawGraph.links) {
    const srcId = typeof link.source === 'object' ? link.source.id : link.source;
    const tgtId = typeof link.target === 'object' ? link.target.id : link.target;
    if (addedNodeIds.has(srcId) && addedNodeIds.has(tgtId)) {
      aggregatedLinks.push({ source: srcId, target: tgtId });
    }
  }

  return { nodes: aggregatedNodes, links: aggregatedLinks };
}
