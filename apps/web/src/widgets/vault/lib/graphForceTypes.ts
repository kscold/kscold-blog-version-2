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
