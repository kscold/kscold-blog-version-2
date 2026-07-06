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
import { isDarkGraphTheme } from '../lib/graphForceUtils';

interface ParallaxStar {
  x: number;
  y: number;
  r: number;
  baseAlpha: number;
  /** 패럴랙스 팩터 — 작을수록 멀리 있는 별처럼 천천히 움직인다 */
  p: number;
  tw: number;
  ph: number;
}

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

interface Ripple {
  id: number;
  x: number;
  y: number;
  color: string;
}

export function VaultGraphView({
  graphData,
  activeNodeSlug,
  onNodeClick,
  onFolderClick,
  folderColorMap = {},
  theme = 'dark',
  highlightFolderId = null,
}: VaultGraphViewProps) {
  const fgRef = useRef<ForceGraphMethods | undefined>(undefined);
  const router = useRouter();
  const [containerRef, { width, height }] = useMeasure<HTMLDivElement>();
  const [hoverNode, setHoverNode] = useState<GraphNode | null>(null);
  const [isGraphHovered, setIsGraphHovered] = useState(false);
  const { reduceMotion, isTouchDevice, supportsHover } = usePerformanceMode();
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

  // 그래프(폴더 필터)가 바뀔 때마다 엔진 안정 후 1회 화면에 맞춰 줌
  const hasAutoFitRef = useRef(false);
  useEffect(() => {
    hasAutoFitRef.current = false;
  }, [gData]);

  const handleEngineStop = useCallback(() => {
    if (hasAutoFitRef.current || activeNodeSlug) return;
    hasAutoFitRef.current = true;
    fgRef.current?.zoomToFit(600, 80);
  }, [activeNodeSlug]);

  // 마우스 기울임 시차 — 데스크탑에서 커서를 움직이면 별 레이어가 깊이별로
  // 살짝 어긋나며 3D 입체감을 만든다 (캔버스 렌더 루프에서 ref만 읽으므로 무비용)
  const mouseRef = useRef({ x: 0, y: 0 });
  const handleParallaxMouse = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseRef.current = {
      x: ((e.clientX - rect.left) / rect.width - 0.5) * 2,
      y: ((e.clientY - rect.top) / rect.height - 0.5) * 2,
    };
  }, []);

  const handleGraphMouseEnter = useCallback(() => {
    if (!supportsHover) return;
    setIsGraphHovered(true);
  }, [supportsHover]);

  const handleGraphMouseLeave = useCallback(() => {
    if (!supportsHover) return;
    setIsGraphHovered(false);
    setHoverNode(null);
    mouseRef.current = { x: 0, y: 0 };
  }, [supportsHover]);

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

  // 클릭 리플 — 이동/필터 액션의 출발점이 시각적으로 느껴지도록
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const rippleSeq = useRef(0);

  const spawnRipple = useCallback((node: NodeObject) => {
    const fg = fgRef.current;
    if (!fg || node.x == null || node.y == null) return;
    const screen = fg.graph2ScreenCoords(node.x, node.y);
    const gn = node as unknown as GraphNode;
    const color = folderColorMap[gn.folderId ?? ''] || '#6E93C4';
    const id = ++rippleSeq.current;
    setRipples(prev => [...prev, { id, x: screen.x, y: screen.y, color }]);
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== id));
    }, 650);
  }, [folderColorMap]);

  const handleNodeClick = useCallback((node: NodeObject) => {
    if (!reduceMotion) spawnRipple(node);
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
  }, [onFolderClick, onNodeClick, router, reduceMotion, spawnRipple]);

  const isLinkHovered = useCallback((link: GraphLink): boolean => {
    if (!hoverNode) return false;
    const srcId = typeof link.source === 'object' ? link.source?.id : link.source;
    const tgtId = typeof link.target === 'object' ? link.target?.id : link.target;
    return srcId === hoverNode.id || tgtId === hoverNode.id;
  }, [hoverNode]);

  const getHoveredLinkParticleCount = useCallback((link: GraphLink): number => {
    if (reducedGraphEffects || !isGraphHovered || !hoverNode || !isLinkHovered(link)) return 0;
    const degree = connectedIds?.size ?? 0;
    if (degree > 80) return 0;
    if (degree > 40) return 1;
    if (degree > 16) return 2;
    return 4;
  }, [connectedIds?.size, hoverNode, isGraphHovered, isLinkHovered, reducedGraphEffects]);

  const nodeCanvasObject = useCallback((node: NodeObject, ctx: CanvasRenderingContext2D, globalScale: number) => {
    renderNode(node, ctx, globalScale, {
      activeNodeSlug,
      hoverNodeId: hoverNode?.id,
      connectedIds,
      highlightFolderId,
      folderColorMap,
      theme,
      reducedEffects: reducedGraphEffects,
    });
  }, [activeNodeSlug, hoverNode?.id, connectedIds, highlightFolderId, folderColorMap, theme, reducedGraphEffects]);

  const linkCanvasObject = useCallback((link: GraphLink, ctx: CanvasRenderingContext2D) => {
    renderGraphLink(link, ctx, {
      hoverNode,
      highlightFolderId,
      folderColorMap,
      reducedEffects: reducedGraphEffects,
    });
  }, [hoverNode, highlightFolderId, folderColorMap, reducedGraphEffects]);

  const zoomBy = useCallback((factor: number) => {
    const fg = fgRef.current;
    if (!fg) return;
    fg.zoom(fg.zoom() * factor, 240);
  }, []);

  const zoomToFit = useCallback(() => {
    fgRef.current?.zoomToFit(420, 48);
  }, []);

  // 줌 배율 HUD — 줌 동작이 끝날 때만 갱신해 리렌더 부담 최소화
  const [zoomPct, setZoomPct] = useState(100);

  // ── 패럴랙스 별 필드 ──
  // 그래프와 같은 캔버스에서, 카메라 이동에 노드보다 "느리게" 반응하는 별을 그린다.
  // 팬/줌할 때 별이 천천히 비켜나며 원근감이 생긴다 (배경이 벽지가 아니라 먼 우주가 됨).
  const starsRef = useRef<ParallaxStar[] | null>(null);

  const renderStarfield = useCallback(
    (ctx: CanvasRenderingContext2D, globalScale: number) => {
      const fg = fgRef.current;
      if (!fg) return;

      if (!starsRef.current) {
        const count = reducedGraphEffects ? 40 : 90;
        const stars: ParallaxStar[] = [];
        for (let i = 0; i < count; i++) {
          const far = i % 3 !== 0; // 2/3 원경 · 1/3 근경, 두 겹의 깊이
          stars.push({
            x: (Math.random() - 0.5) * 3200,
            y: (Math.random() - 0.5) * 3200,
            r: far ? 0.8 + Math.random() * 0.7 : 1.3 + Math.random() * 1.1,
            baseAlpha: far ? 0.22 + Math.random() * 0.18 : 0.32 + Math.random() * 0.22,
            p: far ? 0.08 : 0.35,
            tw: 0.6 + Math.random() * 1.4,
            ph: Math.random() * Math.PI * 2,
          });
        }
        starsRef.current = stars;
      }

      const center = fg.centerAt() as { x: number; y: number };
      if (!center || !isFinite(center.x) || !isFinite(center.y)) return;

      const isDark = isDarkGraphTheme(theme);
      const t = isGraphHovered ? performance.now() / 1000 : 0;

      // 마우스 기울임 시차 — 가까운 별(p 큼)일수록 커서 반대편으로 더 크게 밀린다
      const tiltX = supportsHover ? mouseRef.current.x : 0;
      const tiltY = supportsHover ? mouseRef.current.y : 0;

      ctx.save();
      ctx.fillStyle = isDark ? '#cbd5e1' : '#64748b';
      for (const star of starsRef.current) {
        // 카메라 이동량의 (1-p)만큼 별을 따라 보정 → 화면상 p배 속도로만 움직임
        const tiltShift = (star.p * 26) / globalScale;
        const wx = star.x + center.x * (1 - star.p) - tiltX * tiltShift;
        const wy = star.y + center.y * (1 - star.p) - tiltY * tiltShift;
        const r = star.r / globalScale; // 줌과 무관하게 화면 크기 고정
        const twinkle = reducedGraphEffects ? 1 : 0.7 + 0.3 * Math.sin(t * star.tw + star.ph);
        ctx.globalAlpha = star.baseAlpha * twinkle;
        ctx.beginPath();
        ctx.arc(wx, wy, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    },
    [isGraphHovered, reducedGraphEffects, theme, supportsHover]
  );

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleGraphMouseEnter}
      onMouseLeave={handleGraphMouseLeave}
      onMouseMove={supportsHover ? handleParallaxMouse : undefined}
      className={`w-full h-full relative overflow-hidden rounded-xl gallery-card transition-[opacity,transform] duration-700 ease-out ${entered ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.985]'}`}
    >
      {/* ── 화이트 우주 배경 (순수 CSS — 캔버스 성능 영향 없음) ── */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        {/* 중앙 광원: 종이 위에 빛이 고이는 듯한 깊이감 */}
        <div
          className="absolute inset-0 dark:opacity-0"
          style={{
            background:
              'radial-gradient(ellipse 80% 70% at 50% 45%, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.4) 55%, rgba(226,232,240,0.35) 100%)',
          }}
        />
        <div
          className="absolute inset-0 opacity-0 dark:opacity-100"
          style={{
            background:
              'radial-gradient(ellipse 80% 70% at 50% 45%, rgba(30,41,59,0.0) 0%, rgba(2,6,23,0.35) 100%)',
          }}
        />
        {/* 별은 캔버스 패럴랙스 필드(renderStarfield)가 담당 — 팬/줌에 원근으로 반응 */}
        {/* 은하수 무드의 오로라 — 폴더 컬러 톤과 어울리는 한 줄기 */}
        {!reducedGraphEffects && (
          <>
            <div
              className="absolute -left-1/4 top-[12%] h-[42%] w-[70%] rounded-full blur-3xl opacity-[0.05] dark:opacity-[0.08] animate-pulse"
              style={{
                background: 'linear-gradient(100deg, #6E93C4, transparent 70%)',
                animationDuration: '7s',
                animationPlayState: isGraphHovered ? 'running' : 'paused',
              }}
            />
            <div
              className="absolute -right-1/4 bottom-[10%] h-[38%] w-[64%] rounded-full blur-3xl opacity-[0.04] dark:opacity-[0.07] animate-pulse"
              style={{
                background: 'linear-gradient(260deg, #a78bfa, transparent 70%)',
                animationDuration: '9s',
                animationDelay: '2.5s',
                animationPlayState: isGraphHovered ? 'running' : 'paused',
              }}
            />
          </>
        )}
        {/* 가장자리 비네트: 시선을 그래프 중심으로 */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 120% 110% at 50% 50%, transparent 60%, rgb(100 116 139 / 0.06) 100%)',
          }}
        />
      </div>

      <ForceGraph2D
        ref={fgRef}
        graphData={gData}
        width={width > 0 ? width : 100}
        height={height > 0 ? height : 100}
        nodeLabel={() => ''}
        nodeColor={(node: NodeObject) => folderColorMap[(node as unknown as GraphNode).folderId ?? ''] || '#6E93C4'}
        nodeRelSize={4}
        linkWidth={() => 0}
        linkColor={() => 'transparent'}
        linkDirectionalParticles={getHoveredLinkParticleCount}
        linkDirectionalParticleWidth={(link: GraphLink) =>
          getHoveredLinkParticleCount(link) > 0 ? 2.5 : 0
        }
        linkDirectionalParticleSpeed={reducedGraphEffects || !isGraphHovered ? 0 : 0.004}
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
        onRenderFramePre={renderStarfield}
        onEngineStop={handleEngineStop}
        onZoomEnd={({ k }) => setZoomPct(Math.round(k * 100))}
        backgroundColor="transparent"
      />

      {/* 노드 클릭 리플 — 클릭 지점에서 폴더 컬러 파동이 한 번 퍼진다 */}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          aria-hidden="true"
          className="absolute z-10 pointer-events-none rounded-full animate-vault-ripple"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: 14,
            height: 14,
            marginLeft: -7,
            marginTop: -7,
            border: `2px solid ${ripple.color}`,
            boxShadow: `0 0 18px ${ripple.color}66`,
          }}
        />
      ))}

      {/* 그래프 통계 HUD */}
      <div
        aria-hidden="true"
        className="absolute bottom-3 left-3 z-10 pointer-events-none select-none rounded-full border border-surface-200/60 dark:border-surface-700/60 bg-white/70 dark:bg-surface-900/70 px-3 py-1.5 font-mono text-[10px] tracking-wider text-surface-400 backdrop-blur-sm"
      >
        {gData.nodes.length} notes · {gData.links.length} links · {zoomPct}%
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
