'use client';

import { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useMeasure } from 'react-use';
import ForceGraph2D, { ForceGraphMethods, NodeObject } from 'react-force-graph-2d';
import { GraphNode, GraphData, GraphLink } from '@/types/vault';
import { usePerformanceMode } from '@/shared/model/usePerformanceMode';
import { renderGraphLink, resolveLinkParticleColor } from '../lib/graphLinkRenderer';
import {
  configureForces,
  renderNode,
  renderNodeHitArea,
} from '../lib/graphForceConfig';

interface VaultGraphViewProps {
  graphData: GraphData;
  activeNodeSlug?: string;
  onNodeClick?: (slug: string) => void;
  onFolderClick?: (folderId: string) => void;
  folderColorMap?: Record<string, string>;
  theme?: 'light' | 'dark' | 'system';
}

export function VaultGraphView({
  graphData,
  activeNodeSlug,
  onNodeClick,
  onFolderClick,
  folderColorMap = {},
  theme = 'dark',
}: VaultGraphViewProps) {
  const fgRef = useRef<ForceGraphMethods | undefined>(undefined);
  const router = useRouter();
  const [containerRef, { width, height }] = useMeasure<HTMLDivElement>();
  const [hoverNode, setHoverNode] = useState<GraphNode | null>(null);
  const { reduceMotion, isTouchDevice } = usePerformanceMode();
  const reducedGraphEffects = reduceMotion || isTouchDevice;

  const gData = useMemo(() => {
    return {
      nodes: graphData.nodes.map((n: GraphNode) => ({
        ...n,
        val: n.val ?? (n.size ? n.size * 2 : 4),
      })),
      links: graphData.links.map((l: GraphLink) => ({ ...l })),
    };
  }, [graphData]);

  // 포스 시뮬레이션 설정
  useEffect(() => {
    const fg = fgRef.current;
    if (!fg) return;
    configureForces({ fg, nodeCount: gData.nodes.length, reducedEffects: reducedGraphEffects });
  }, [gData, reducedGraphEffects]);

  // 활성 노드로 중앙 이동
  useEffect(() => {
    if (activeNodeSlug && fgRef.current && gData.nodes.length > 0) {
      const activeNode = gData.nodes.find(
        (n: GraphNode) => n.slug === activeNodeSlug
      ) as unknown as NodeObject;
      if (activeNode && activeNode.x && activeNode.y) {
        const duration = reducedGraphEffects ? 0 : 1000;
        fgRef.current.centerAt(activeNode.x, activeNode.y, duration);
        fgRef.current.zoom(1.5, duration);
      }
    }
  }, [activeNodeSlug, gData, reducedGraphEffects]);

  const handleNodeClick = useCallback((node: NodeObject) => {
    const gn = node as unknown as GraphNode;
    if (gn.isFolder && onFolderClick) {
      onFolderClick(gn.id);
    } else if (gn.slug) {
      if (onNodeClick) {
        onNodeClick(gn.slug);
      } else {
        router.push(`/vault/${gn.slug}`);
      }
    }
  }, [onFolderClick, onNodeClick, router]);

  const isLinkHovered = useCallback((link: GraphLink): boolean => {
    if (!hoverNode) return false;
    const srcId = typeof link.source === 'object' ? link.source?.id : link.source;
    const tgtId = typeof link.target === 'object' ? link.target?.id : link.target;
    return srcId === hoverNode.id || tgtId === hoverNode.id;
  }, [hoverNode]);

  const nodeCanvasObject = useCallback((node: NodeObject, ctx: CanvasRenderingContext2D, globalScale: number) => {
    renderNode(node, ctx, globalScale, {
      activeNodeSlug,
      hoverNodeId: hoverNode?.id,
      folderColorMap,
      theme,
      reducedEffects: reducedGraphEffects,
    });
  }, [activeNodeSlug, hoverNode?.id, folderColorMap, theme, reducedGraphEffects]);

  const linkCanvasObject = useCallback((link: GraphLink, ctx: CanvasRenderingContext2D) => {
    renderGraphLink(link, ctx, {
      hoverNode,
      folderColorMap,
      reducedEffects: reducedGraphEffects,
    });
  }, [hoverNode, folderColorMap, reducedGraphEffects]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative overflow-hidden rounded-xl gallery-card"
    >
      <ForceGraph2D
        ref={fgRef}
        graphData={gData}
        width={width > 0 ? width : 100}
        height={height > 0 ? height : 100}
        nodeLabel={() => ''}
        nodeColor={(node: NodeObject) => folderColorMap[(node as unknown as GraphNode).folderId ?? ''] || '#64C8FF'}
        nodeRelSize={4}
        linkWidth={() => 0}
        linkColor={() => 'transparent'}
        linkDirectionalParticles={(link: GraphLink) => (reducedGraphEffects ? 0 : isLinkHovered(link) ? 8 : 4)}
        linkDirectionalParticleWidth={(link: GraphLink) => (reducedGraphEffects ? 0 : isLinkHovered(link) ? 4 : 2.5)}
        linkDirectionalParticleSpeed={reducedGraphEffects ? 0 : 0.006}
        linkDirectionalParticleColor={(link: GraphLink) =>
          resolveLinkParticleColor(link, gData.nodes, folderColorMap)
        }
        linkCanvasObjectMode={() => 'replace'}
        linkCanvasObject={linkCanvasObject}
        onNodeClick={handleNodeClick}
        d3AlphaDecay={reducedGraphEffects ? 0.05 : 0.015}
        d3VelocityDecay={reducedGraphEffects ? 0.48 : 0.35}
        warmupTicks={reducedGraphEffects ? 36 : 80}
        cooldownTicks={reducedGraphEffects ? 90 : 180}
        nodeCanvasObject={nodeCanvasObject}
        nodePointerAreaPaint={renderNodeHitArea}
        onNodeHover={node => {
          setHoverNode((node as GraphNode) || null);
          const el = document.querySelector('canvas');
          if (el) el.style.cursor = node ? 'pointer' : 'default';
        }}
        backgroundColor="transparent"
      />
    </div>
  );
}
