import { GraphData, GraphLink, GraphNode, VaultFolder, VaultNote } from '@/types/vault';
import { findFolderById, getSubfolderIds } from './folderTree';

export function getLocalGraph(
  rawGraph: GraphData,
  currentNote: VaultNote,
  backlinks: VaultNote[]
): { nodes: GraphNode[]; links: GraphLink[] } {
  if (!rawGraph || !currentNote) {
    return { nodes: [], links: [] };
  }

  const connectedIds = new Set<string>([currentNote.id]);

  for (const linkId of currentNote.outgoingLinks || []) {
    connectedIds.add(linkId);
  }

  for (const backlink of backlinks || []) {
    connectedIds.add(backlink.id);
  }

  const localNodes = rawGraph.nodes
    .filter(node => connectedIds.has(node.id))
    .map(node => ({
      ...node,
      val: node.id === currentNote.id ? 8 : (node.size || 1),
      isFolder: false,
      isCenter: node.id === currentNote.id,
    }));

  const localLinks = rawGraph.links.filter(link => {
    const sourceId = typeof link.source === 'object' ? (link.source as GraphNode).id : link.source;
    const targetId = typeof link.target === 'object' ? (link.target as GraphNode).id : link.target;
    return connectedIds.has(sourceId) && connectedIds.has(targetId);
  });

  return { nodes: localNodes, links: localLinks };
}

export function getAggregatedGraph(
  rawGraph: GraphData,
  folders: VaultFolder[],
  activeFolderId: string | null
): { nodes: GraphNode[]; links: GraphLink[] } {
  if (!rawGraph) {
    return { nodes: [], links: [] };
  }

  return activeFolderId === null
    ? buildRootAggregatedGraph(rawGraph, folders)
    : buildFolderAggregatedGraph(rawGraph, folders, activeFolderId);
}

function buildRootAggregatedGraph(
  rawGraph: GraphData,
  folders: VaultFolder[]
): { nodes: GraphNode[]; links: GraphLink[] } {
  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];
  const rootFolders = folders.filter(folder => !folder.parent);

  for (const root of rootFolders) {
    const rootDescendantIds = getSubfolderIds(folders, root.id);
    const notesInRoot = rawGraph.nodes.filter(
      node => node.folderId && rootDescendantIds.includes(node.folderId)
    );

    if (notesInRoot.length === 0 && !(root.children && root.children.length > 0)) {
      continue;
    }

    nodes.push(createFolderNode(root.id, root.name, root.id, notesInRoot.length, 12, 50, 8, 5));

    for (const child of root.children || []) {
      const childDescendantIds = getSubfolderIds(folders, child.id);
      const notesInChild = rawGraph.nodes.filter(
        node => node.folderId && childDescendantIds.includes(node.folderId)
      );

      if (notesInChild.length === 0 && !(child.children && child.children.length > 0)) {
        continue;
      }

      nodes.push(createFolderNode(child.id, child.name, root.id, notesInChild.length, 8, 35, 6, 3));
      links.push({ source: root.id, target: child.id });
    }
  }

  return { nodes, links };
}

function buildFolderAggregatedGraph(
  rawGraph: GraphData,
  folders: VaultFolder[],
  activeFolderId: string
): { nodes: GraphNode[]; links: GraphLink[] } {
  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];
  const currentFolder = findFolderById(folders, activeFolderId);
  const directChildren = currentFolder?.children || [];
  const addedNodeIds = new Set<string>([activeFolderId]);

  if (currentFolder) {
    const descendantIds = getSubfolderIds(folders, activeFolderId);
    const totalNotes = rawGraph.nodes.filter(
      node => node.folderId && descendantIds.includes(node.folderId)
    ).length;

    nodes.push(createFolderNode(activeFolderId, currentFolder.name, activeFolderId, totalNotes, 20, 50, 7, 5));
  }

  for (const child of directChildren) {
    const childDescendantIds = getSubfolderIds(folders, child.id);
    const notesInChild = rawGraph.nodes.filter(
      node => node.folderId && childDescendantIds.includes(node.folderId)
    );

    if (notesInChild.length === 0 && !(child.children && child.children.length > 0)) {
      continue;
    }

    nodes.push(createFolderNode(child.id, child.name, activeFolderId, notesInChild.length, 10, 30, 5, 3));
    addedNodeIds.add(child.id);
    links.push({ source: activeFolderId, target: child.id });

    for (const note of notesInChild.slice(0, 30)) {
      nodes.push({ ...note, val: Math.max(4, (note.size || 1) + 3), isFolder: false });
      addedNodeIds.add(note.id);
      links.push({ source: child.id, target: note.id });
    }
  }

  const directNotes = rawGraph.nodes.filter(node => node.folderId === activeFolderId);
  for (const note of directNotes.slice(0, 50)) {
    if (addedNodeIds.has(note.id)) {
      continue;
    }

    nodes.push({ ...note, val: Math.max(4, (note.size || 1) + 3), isFolder: false });
    addedNodeIds.add(note.id);
    links.push({ source: activeFolderId, target: note.id });
  }

  for (const link of rawGraph.links) {
    const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
    const targetId = typeof link.target === 'object' ? link.target.id : link.target;

    if (addedNodeIds.has(sourceId) && addedNodeIds.has(targetId)) {
      links.push({ source: sourceId, target: targetId });
    }
  }

  return { nodes, links };
}

function createFolderNode(
  id: string,
  name: string,
  folderId: string,
  noteCount: number,
  min: number,
  max: number,
  multiplier: number,
  offset: number
): GraphNode {
  return {
    id,
    name,
    slug: '',
    size: 0,
    val: Math.min(max, Math.max(min, Math.log(noteCount + 1) * multiplier + offset)),
    folderId,
    isFolder: true,
  };
}
