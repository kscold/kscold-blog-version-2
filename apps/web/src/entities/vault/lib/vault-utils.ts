import { VaultFolder, VaultNote, GraphData, GraphNode, GraphLink } from '@/types/vault';

const CATEGORY_COLORS = [
  '#64C8FF', // Deep Sky Blue
  '#A855F7', // Purple
  '#F43F5E', // Rose
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#3B82F6', // Blue
];

// Flat map of folder IDs to their assigned root color
export function buildFolderColorMap(folders: VaultFolder[]): Record<string, string> {
  const map: Record<string, string> = {};

  // Find roots
  const roots = folders.filter(f => !f.parent);

  // Assign a color to each root, then recursively assign it to all children
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

// Get all descendants for a folder ID
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

  // Collect IDs of all connected notes
  const connectedIds = new Set<string>();
  connectedIds.add(currentNote.id);

  // Outgoing links (note IDs this note links to)
  for (const linkId of currentNote.outgoingLinks || []) {
    connectedIds.add(linkId);
  }

  // Backlinks (notes that link TO this note)
  for (const bl of backlinks || []) {
    connectedIds.add(bl.id);
  }

  // Filter nodes
  const localNodes = rawGraph.nodes
    .filter(n => connectedIds.has(n.id))
    .map(n => ({
      ...n,
      val: n.id === currentNote.id ? 8 : (n.size || 1),
      isFolder: false,
      isCenter: n.id === currentNote.id,
    }));

  // Filter links: both source and target must be in the local set
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

  // Map subfolders
  for (const subfolder of directSubfolders) {
    const descendantIds = getSubfolderIds(folders, subfolder.id);
    const notesInside = rawGraph.nodes.filter(
      n => n.folderId && descendantIds.includes(n.folderId)
    );

    for (const node of notesInside) {
      nodeMapping.set(node.id, subfolder.id);
    }

    const hasChildren = subfolder.children && subfolder.children.length > 0;

    // Show folder if it has notes inside or has child subfolders
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

  // Map direct notes
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

  // Aggregate links
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
