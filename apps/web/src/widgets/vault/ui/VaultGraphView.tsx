'use client';

import ForceGraph2D, { NodeObject } from 'react-force-graph-2d';
import { GraphNode, GraphData, GraphLink } from '@/shared/model/types/vault';
import { resolveLinkParticleColor } from '../lib/graphLinkRenderer';
import { VaultGraphBackdrop } from './graph/VaultGraphBackdrop';
import { VaultGraphRipples } from './graph/VaultGraphRipples';
import { VaultGraphStatsHud } from './graph/VaultGraphStatsHud';
import { VaultGraphZoomControls } from './graph/VaultGraphZoomControls';
import { useVaultForceGraph } from '../model/useVaultForceGraph';

interface VaultGraphViewProps {
  graphData: GraphData;
  activeNodeSlug?: string;
  onNodeClick?: (slug: string) => void;
  onFolderClick?: (folderId: string) => void;
  folderColorMap?: Record<string, string>;
  theme?: 'light' | 'dark' | 'system';
  /** 사이드바에서 호버 중인 폴더 — 해당 폴더만 스포트라이트 */
  highlightFolderId?: string | null;
}

export function VaultGraphView(props: VaultGraphViewProps) {
  const g = useVaultForceGraph(props);

  return (
    <div
      ref={g.containerRef}
      onMouseEnter={g.handleGraphMouseEnter}
      onMouseLeave={g.handleGraphMouseLeave}
      onMouseMove={g.supportsHover ? g.handleParallaxMouse : undefined}
      className={`w-full h-full relative overflow-hidden rounded-xl gallery-card select-none touch-none transition-[opacity,transform] duration-700 ease-out ${g.entered ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.985]'}`}
    >
      <VaultGraphBackdrop reducedGraphEffects={g.reducedGraphEffects} isGraphHovered={g.isGraphHovered} />

      <ForceGraph2D
        ref={g.fgRef}
        graphData={g.gData}
        width={g.width > 0 ? g.width : 100}
        height={g.height > 0 ? g.height : 100}
        nodeLabel={() => ''}
        nodeColor={(node: NodeObject) => g.folderColorMap[(node as unknown as GraphNode).folderId ?? ''] || '#6E93C4'}
        nodeRelSize={4}
        linkWidth={() => 0}
        linkColor={() => 'transparent'}
        linkDirectionalParticles={g.getHoveredLinkParticleCount}
        linkDirectionalParticleWidth={(link: GraphLink) =>
          g.getHoveredLinkParticleCount(link) > 0 ? 2.5 : 0
        }
        linkDirectionalParticleSpeed={g.reducedGraphEffects || !g.isGraphHovered ? 0 : 0.004}
        linkDirectionalParticleColor={(link: GraphLink) =>
          resolveLinkParticleColor(link, g.gData.nodes, g.folderColorMap)
        }
        linkCanvasObjectMode={() => 'replace'}
        linkCanvasObject={g.linkCanvasObject}
        onNodeClick={g.handleNodeClick}
        onNodeDrag={g.handleNodeDrag}
        onNodeDragEnd={g.handleNodeDragEnd}
        enableNodeDrag
        enablePanInteraction
        enableZoomInteraction
        d3AlphaDecay={g.reducedGraphEffects ? 0.05 : 0.015}
        d3VelocityDecay={g.reducedGraphEffects ? 0.48 : 0.35}
        warmupTicks={g.reducedGraphEffects ? 36 : 80}
        cooldownTicks={g.reducedGraphEffects ? 90 : 180}
        nodeCanvasObject={g.nodeCanvasObject}
        nodePointerAreaPaint={g.renderNodeHitArea}
        onNodeHover={node => {
          g.setHoverNode((node as GraphNode) || null);
          const el = document.querySelector('canvas');
          if (el) el.style.cursor = node ? 'pointer' : 'default';
        }}
        onRenderFramePre={g.handleRenderStarfield}
        onEngineStop={g.handleEngineStop}
        onZoomEnd={({ k }) => g.setZoomPct(Math.round(k * 100))}
        backgroundColor="transparent"
      />

      <VaultGraphRipples ripples={g.ripples} />

      <VaultGraphStatsHud
        nodeCount={g.gData.nodes.length}
        linkCount={g.gData.links.length}
        zoomPct={g.zoomPct}
      />

      <VaultGraphZoomControls
        onZoomIn={() => g.zoomBy(1.45)}
        onZoomOut={() => g.zoomBy(1 / 1.45)}
        onZoomToFit={g.zoomToFit}
      />
    </div>
  );
}
