import type { ForceGraphMethods, NodeObject } from 'react-force-graph-2d';

export interface NodeRuntime extends NodeObject {
  name?: string;
  slug?: string;
  size?: number;
  val?: number;
  folderId?: string;
  isFolder?: boolean;
  isCenter?: boolean;
}

export interface ConfigureForcesOptions {
  fg: ForceGraphMethods;
  nodeCount: number;
  reducedEffects?: boolean;
}

export interface RenderNodeOptions {
  activeNodeSlug?: string;
  hoverNodeId?: string;
  /** 호버 중인 노드와 직접 연결된 노드 id 집합 — 나머지는 dim 처리 */
  connectedIds?: Set<string> | null;
  /** 사이드바에서 호버 중인 폴더 id — 해당 폴더 소속 외 노드는 dim 처리 */
  highlightFolderId?: string | null;
  folderColorMap: Record<string, string>;
  theme: 'light' | 'dark' | 'system';
  reducedEffects?: boolean;
}

export interface LabelOptions {
  label: string;
  isFolder: boolean;
  focused: boolean;
  isDark: boolean;
  radius: number;
  nodeColor: string;
}
