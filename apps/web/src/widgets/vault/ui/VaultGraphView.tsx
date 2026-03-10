'use client';

import { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useMeasure } from 'react-use';
import ForceGraph2D, { ForceGraphMethods, NodeObject } from 'react-force-graph-2d';
import { GraphNode, GraphData, GraphLink } from '@/types/vault';
import {
  configureForces,
  renderNode,
  renderNodeHitArea,
} from '@/widgets/vault/lib/graphForceConfig';

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

  const gData = useMemo(() => {
    return {
      nodes: graphData.nodes.map((n: GraphNode) => ({
        ...n,
        val: n.val ?? (n.size ? n.size * 2 : 4),
      })),
      links: graphData.links.map((l: GraphLink) => ({ ...l })),
    };
  }, [graphData]);

  // Configure force simulation
  useEffect(() => {
    const fg = fgRef.current;
    if (!fg) return;
    configureForces({ fg, nodeCount: gData.nodes.length });
  }, [gData]);

  // Center on active node
  useEffect(() => {
    if (activeNodeSlug && fgRef.current && gData.nodes.length > 0) {
      const activeNode = gData.nodes.find(
        (n: GraphNode) => n.slug === activeNodeSlug
      ) as unknown as NodeObject;
      if (activeNode && activeNode.x && activeNode.y) {
        fgRef.current.centerAt(activeNode.x, activeNode.y, 1000);
        fgRef.current.zoom(1.5, 1000);
      }
    }
  }, [activeNodeSlug, gData]);

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
    });
  }, [activeNodeSlug, hoverNode?.id, folderColorMap, theme]);

  const linkCanvasObject = useCallback((link: GraphLink, ctx: CanvasRenderingContext2D) => {
    if (!hoverNode) return;
    const srcId = typeof link.source === 'object' ? link.source?.id : link.source;
    const tgtId = typeof link.target === 'object' ? link.target?.id : link.target;
    if (srcId !== hoverNode.id && tgtId !== hoverNode.id) return;
    const src = link.source;
    const tgt = link.target;
    if (typeof src !== 'object' || typeof tgt !== 'object') return;
    if (src.x == null || src.y == null || tgt.x == null || tgt.y == null) return;
    if (!isFinite(src.x) || !isFinite(src.y) || !isFinite(tgt.x) || !isFinite(tgt.y)) return;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(src.x, src.y);
    ctx.lineTo(tgt.x, tgt.y);
    ctx.strokeStyle = 'rgba(100, 200, 255, 0.12)';
    ctx.lineWidth = 6;
    ctx.stroke();
    ctx.restore();
  }, [hoverNode]);

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
        linkWidth={(link: GraphLink) => (isLinkHovered(link) ? 2.5 : 0.8)}
        linkColor={(link: GraphLink) =>
          isLinkHovered(link) ? 'rgba(100, 200, 255, 0.5)' : 'rgba(255, 255, 255, 0.04)'
        }
        linkDirectionalParticles={3}
        linkDirectionalParticleWidth={(link: GraphLink) => (isLinkHovered(link) ? 3 : 1.2)}
        linkDirectionalParticleSpeed={0.004}
        linkDirectionalParticleColor={(link: GraphLink) => {
          const sourceNode = typeof link.source === 'object' ? link.source : null;
          const folderId =
            sourceNode?.folderId ||
            gData.nodes.find(
              (n: GraphNode) => n.id === (typeof link.source === 'string' ? link.source : link.source?.id)
            )?.folderId;
          return folderColorMap[folderId ?? ''] || '#64C8FF';
        }}
        linkCanvasObjectMode={() => 'after'}
        linkCanvasObject={linkCanvasObject}
        onNodeClick={handleNodeClick}
        d3AlphaDecay={0.01}
        d3VelocityDecay={0.2}
        warmupTicks={200}
        cooldownTicks={300}
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
