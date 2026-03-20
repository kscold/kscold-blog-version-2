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
    configureForces({ fg, nodeCount: gData.nodes.length });
  }, [gData]);

  // 활성 노드로 중앙 이동
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
    const src = link.source;
    const tgt = link.target;
    if (typeof src !== 'object' || typeof tgt !== 'object') return;
    if (src.x == null || src.y == null || tgt.x == null || tgt.y == null) return;
    if (!isFinite(src.x) || !isFinite(src.y) || !isFinite(tgt.x) || !isFinite(tgt.y)) return;

    const srcNode = src as GraphNode;
    const tgtNode = tgt as GraphNode;
    const isHovered = hoverNode && (srcNode.id === hoverNode.id || tgtNode.id === hoverNode.id);

    const srcColor = folderColorMap[srcNode.folderId ?? ''] || '#64C8FF';
    const tgtColor = folderColorMap[tgtNode.folderId ?? ''] || srcColor;

    // 곡선 제어점 계산 (시냅스 곡선 효과)
    const dx = tgt.x - src.x;
    const dy = tgt.y - src.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const curve = len * 0.18;
    const cx = (src.x + tgt.x) / 2 - (dy / len) * curve;
    const cy = (src.y + tgt.y) / 2 + (dx / len) * curve;

    ctx.save();

    if (isHovered) {
      // 외부 글로우
      ctx.beginPath();
      ctx.moveTo(src.x, src.y);
      ctx.quadraticCurveTo(cx, cy, tgt.x, tgt.y);
      ctx.strokeStyle = srcColor + '40';
      ctx.lineWidth = 10;
      ctx.shadowColor = srcColor;
      ctx.shadowBlur = 20;
      ctx.stroke();

      // 그라디언트 메인 라인
      const grad = ctx.createLinearGradient(src.x, src.y, tgt.x, tgt.y);
      grad.addColorStop(0, srcColor + 'ee');
      grad.addColorStop(1, tgtColor + 'ee');
      ctx.beginPath();
      ctx.moveTo(src.x, src.y);
      ctx.quadraticCurveTo(cx, cy, tgt.x, tgt.y);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2;
      ctx.shadowColor = srcColor;
      ctx.shadowBlur = 8;
      ctx.stroke();
    } else {
      // 기본: 희미한 곡선 + 그라디언트
      const grad = ctx.createLinearGradient(src.x, src.y, tgt.x, tgt.y);
      grad.addColorStop(0, srcColor + '55');
      grad.addColorStop(0.5, srcColor + '33');
      grad.addColorStop(1, tgtColor + '55');
      ctx.beginPath();
      ctx.moveTo(src.x, src.y);
      ctx.quadraticCurveTo(cx, cy, tgt.x, tgt.y);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    ctx.restore();
  }, [hoverNode, folderColorMap]);

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
        linkDirectionalParticles={(link: GraphLink) => (isLinkHovered(link) ? 8 : 4)}
        linkDirectionalParticleWidth={(link: GraphLink) => (isLinkHovered(link) ? 4 : 2.5)}
        linkDirectionalParticleSpeed={0.006}
        linkDirectionalParticleColor={(link: GraphLink) => {
          const sourceNode = typeof link.source === 'object' ? link.source : null;
          const folderId =
            sourceNode?.folderId ||
            gData.nodes.find(
              (n: GraphNode) => n.id === (typeof link.source === 'string' ? link.source : link.source?.id)
            )?.folderId;
          return folderColorMap[folderId ?? ''] || '#64C8FF';
        }}
        linkCanvasObjectMode={() => 'replace'}
        linkCanvasObject={linkCanvasObject}
        onNodeClick={handleNodeClick}
        d3AlphaDecay={0.003}
        d3VelocityDecay={0.35}
        warmupTicks={80}
        cooldownTicks={Infinity}
        onEngineStop={() => {
          setTimeout(() => {
            fgRef.current?.d3ReheatSimulation();
          }, 3000);
        }}
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
