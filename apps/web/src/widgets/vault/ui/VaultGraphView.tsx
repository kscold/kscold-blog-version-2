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

  // 노드별 인접 노드 집합 — 호버 포커스(비연결 dim)용
  const adjacency = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const link of gData.links) {
      const srcId = String(typeof link.source === 'object' ? link.source?.id : link.source);
      const tgtId = String(typeof link.target === 'object' ? link.target?.id : link.target);
      if (!map.has(srcId)) map.set(srcId, new Set());
      if (!map.has(tgtId)) map.set(tgtId, new Set());
      map.get(srcId)!.add(tgtId);
      map.get(tgtId)!.add(srcId);
    }
    return map;
  }, [gData.links]);

  const connectedIds = useMemo(() => {
    if (!hoverNode) return null;
    return adjacency.get(String(hoverNode.id)) ?? new Set<string>();
  }, [hoverNode, adjacency]);

  // 진입 페이드 — 시뮬레이션 워밍업 동안의 어수선한 첫 프레임을 가린다
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 80);
    return () => clearTimeout(t);
  }, []);

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
      connectedIds,
      folderColorMap,
      theme,
      reducedEffects: reducedGraphEffects,
    });
  }, [activeNodeSlug, hoverNode?.id, connectedIds, folderColorMap, theme, reducedGraphEffects]);

  const linkCanvasObject = useCallback((link: GraphLink, ctx: CanvasRenderingContext2D) => {
    renderGraphLink(link, ctx, {
      hoverNode,
      folderColorMap,
      reducedEffects: reducedGraphEffects,
    });
  }, [hoverNode, folderColorMap, reducedGraphEffects]);

  const zoomBy = useCallback((factor: number) => {
    const fg = fgRef.current;
    if (!fg) return;
    fg.zoom(fg.zoom() * factor, 240);
  }, []);

  const zoomToFit = useCallback(() => {
    fgRef.current?.zoomToFit(420, 48);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full relative overflow-hidden rounded-xl gallery-card transition-[opacity,transform] duration-700 ease-out ${entered ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.985]'}`}
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
        linkDirectionalParticles={(link: GraphLink) =>
          reducedGraphEffects ? 0 : hoverNode ? (isLinkHovered(link) ? 8 : 0) : 4
        }
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

      {/* 그래프 통계 HUD */}
      <div
        aria-hidden="true"
        className="absolute bottom-3 left-3 z-10 pointer-events-none select-none rounded-full border border-surface-200/60 dark:border-surface-700/60 bg-white/70 dark:bg-surface-900/70 px-3 py-1.5 font-mono text-[10px] tracking-wider text-surface-400 backdrop-blur-sm"
      >
        {gData.nodes.length} notes · {gData.links.length} links
      </div>

      {/* 줌 컨트롤 — 모바일에선 폴더 FAB와 겹치지 않게 위로 */}
      <div className="absolute bottom-20 right-3 lg:bottom-4 lg:right-4 z-10 flex flex-col overflow-hidden rounded-2xl border border-surface-200/70 dark:border-surface-700/70 bg-white/80 dark:bg-surface-900/80 shadow-sm backdrop-blur-md">
        <button
          type="button"
          onClick={() => zoomBy(1.45)}
          aria-label="확대"
          className="flex h-10 w-10 items-center justify-center text-surface-500 transition-colors hover:bg-surface-100 hover:text-surface-900 dark:hover:bg-surface-800 dark:hover:text-white active:bg-surface-200/70"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>
        <div className="h-px bg-surface-200/70 dark:bg-surface-700/70" />
        <button
          type="button"
          onClick={() => zoomBy(1 / 1.45)}
          aria-label="축소"
          className="flex h-10 w-10 items-center justify-center text-surface-500 transition-colors hover:bg-surface-100 hover:text-surface-900 dark:hover:bg-surface-800 dark:hover:text-white active:bg-surface-200/70"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15" />
          </svg>
        </button>
        <div className="h-px bg-surface-200/70 dark:bg-surface-700/70" />
        <button
          type="button"
          onClick={zoomToFit}
          aria-label="전체 보기"
          className="flex h-10 w-10 items-center justify-center text-surface-500 transition-colors hover:bg-surface-100 hover:text-surface-900 dark:hover:bg-surface-800 dark:hover:text-white active:bg-surface-200/70"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 9V5.25A1.5 1.5 0 015.25 3.75H9m6 0h3.75a1.5 1.5 0 011.5 1.5V9m0 6v3.75a1.5 1.5 0 01-1.5 1.5H15m-6 0H5.25a1.5 1.5 0 01-1.5-1.5V15"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
