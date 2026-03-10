export interface VaultNote {
  id: string;
  title: string;
  slug: string;
  content: string;
  folderId: string;
  author: {
    id: string;
    name: string;
  };
  outgoingLinks: string[];
  tags: string[];
  views: number;
  commentsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface VaultFolder {
  id: string;
  name: string;
  slug: string;
  parent?: string;
  depth: number;
  order: number;
  noteCount: number;
  children?: VaultFolder[];
  createdAt: string;
  updatedAt: string;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export interface GraphNode {
  id: string;
  name: string;
  slug: string;
  size: number;
  val?: number;
  folderId?: string;
  isFolder?: boolean;
  // ForceGraph2D runtime-injected properties
  x?: number;
  y?: number;
}

export interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
}

export interface VaultNoteCreateRequest {
  title: string;
  slug?: string;
  content: string;
  folderId: string;
  tags?: string[];
}

export interface VaultNoteUpdateRequest {
  title?: string;
  slug?: string;
  content?: string;
  folderId?: string;
  tags?: string[];
}

export interface VaultNoteComment {
  id: string;
  noteId: string;
  authorName: string;
  isAdmin: boolean;
  content: string;
  createdAt: string;
}

export interface VaultNoteCommentCreateRequest {
  authorName: string;
  authorPassword: string;
  content: string;
}
