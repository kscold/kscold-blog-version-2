import { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useMeasure } from 'react-use';
import { ForceGraphMethods, NodeObject } from 'react-force-graph-2d';
import { GraphNode, GraphData, GraphLink } from '@/shared/model/types/vault';
import { usePerformanceMode } from '@/shared/model/usePerformanceMode';
import { renderGraphLink } from '../lib/graphLinkRenderer';
import {
  configureForces,
  renderNode,
  renderNodeHitArea,
} from '../lib/graphForceConfig';
import { createStarfield, renderStarfield, type ParallaxStar } from '../lib/graphStarfield';
import { type Ripple } from '../ui/graph/VaultGraphRipples';

interface UseVaultForceGraphParams {
  graphData: GraphData;
  activeNodeSlug?: string;
  onNodeClick?: (slug: string) => void;
  onFolderClick?: (folderId: string) => void;
  folderColorMap?: Record<string, string>;
  theme?: 'light' | 'dark' | 'system';
  /** 사이드바에서 호버 중인 폴더 — 해당 폴더만 스포트라이트 */
  highlightFolderId?: string | null;
}

export function useVaultForceGraph({
  graphData,
  activeNodeSlug,
  onNodeClick,
  onFolderClick,
  folderColorMap = {},
  theme = 'dark',
  highlightFolderId = null,
}: UseVaultForceGraphParams) {
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

  // 진입 페이드 — 시뮬레이션 워밍업 동안의 어수선한 첫 프레임을 가림
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
  const nodeDragStateRef = useRef({
    isDragging: false,
    didMove: false,
    suppressClickUntil: 0,
  });

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
    if (nodeDragStateRef.current.isDragging || Date.now() < nodeDragStateRef.current.suppressClickUntil) {
      return;
    }

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

  const handleNodeDrag = useCallback((_node: NodeObject, translate: { x: number; y: number }) => {
    nodeDragStateRef.current.isDragging = true;
    if (Math.abs(translate.x) > 1 || Math.abs(translate.y) > 1) {
      nodeDragStateRef.current.didMove = true;
    }
  }, []);

  const handleNodeDragEnd = useCallback(() => {
    const didMove = nodeDragStateRef.current.didMove;
    nodeDragStateRef.current.isDragging = false;
    nodeDragStateRef.current.didMove = false;

    if (didMove) {
      nodeDragStateRef.current.suppressClickUntil = Date.now() + 250;
      fgRef.current?.d3ReheatSimulation();
    }
  }, []);

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
  // 그래프와 같은 캔버스에서, 카메라 이동에 노드보다 "느리게" 반응하는 별을 그림.
  // 팬/줌할 때 별이 천천히 비켜나며 원근감이 생긴다 (배경이 벽지가 아니라 먼 우주가 됨).
  const starsRef = useRef<ParallaxStar[] | null>(null);

  const handleRenderStarfield = useCallback(
    (ctx: CanvasRenderingContext2D, globalScale: number) => {
      const fg = fgRef.current;
      if (!fg) return;
      if (!starsRef.current) {
        starsRef.current = createStarfield(reducedGraphEffects);
      }
      renderStarfield(ctx, globalScale, {
        fg,
        stars: starsRef.current,
        theme,
        isGraphHovered,
        reducedEffects: reducedGraphEffects,
        mouse: mouseRef.current,
        supportsHover,
      });
    },
    [isGraphHovered, reducedGraphEffects, theme, supportsHover]
  );

  return {
    containerRef, fgRef, gData, width, height, entered,
    isGraphHovered, reducedGraphEffects, supportsHover, folderColorMap,
    ripples, zoomPct,
    handleGraphMouseEnter, handleGraphMouseLeave, handleParallaxMouse,
    handleNodeClick, handleNodeDrag, handleNodeDragEnd,
    nodeCanvasObject, linkCanvasObject, getHoveredLinkParticleCount,
    handleRenderStarfield, handleEngineStop, renderNodeHitArea,
    setHoverNode, setZoomPct, zoomBy, zoomToFit,
  };
}
