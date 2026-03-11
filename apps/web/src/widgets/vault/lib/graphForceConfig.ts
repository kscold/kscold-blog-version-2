import { forceCollide, SimulationNodeDatum } from 'd3-force';
import { ForceGraphMethods, NodeObject } from 'react-force-graph-2d';
import { GraphNode } from '@/types/vault';

interface NodeRuntime extends NodeObject {
  name?: string;
  slug?: string;
  size?: number;
  val?: number;
  folderId?: string;
  isFolder?: boolean;
  isCenter?: boolean;
}

interface ConfigureForcesOptions {
  fg: ForceGraphMethods;
  nodeCount: number;
}

/**
 * d3-force 시뮬레이션의 charge, link, collision, center 힘을 설정한다.
 * 노드 수에 따라 힘의 강도를 동적으로 조절한다.
 */
export function configureForces({ fg, nodeCount }: ConfigureForcesOptions): void {
  const chargeStrength = nodeCount > 100 ? -300 : nodeCount > 30 ? -200 : -120;
  const linkDist = nodeCount > 100 ? 120 : nodeCount > 30 ? 100 : 80;

  fg.d3Force('charge')?.strength(chargeStrength).distanceMax(500);
  fg.d3Force('link')?.distance(linkDist);

  fg.d3Force(
    'collision',
    forceCollide()
      .radius((datum: SimulationNodeDatum) => {
        const node = datum as NodeRuntime;
        const r = node.isFolder ? Math.sqrt(node.val || 10) * 3 : Math.sqrt(node.val || 1) * 2;
        return r + 15;
      })
      .strength(0.9)
      .iterations(3)
  );

  fg.d3Force('center')?.strength(0.03);
  fg.d3ReheatSimulation();
}

interface RenderNodeOptions {
  activeNodeSlug?: string;
  hoverNodeId?: string;
  folderColorMap: Record<string, string>;
  theme: 'light' | 'dark' | 'system';
}

/**
 * ForceGraph2D의 nodeCanvasObject 콜백.
 * 노드 원, 테두리, 라벨 텍스트를 Canvas API로 렌더링한다.
 */
export function renderNode(
  node: NodeRuntime,
  ctx: CanvasRenderingContext2D,
  globalScale: number,
  options: RenderNodeOptions
): void {
  if (node.x == null || node.y == null || !isFinite(node.x) || !isFinite(node.y)) return;

  try {
    const { activeNodeSlug, hoverNodeId, folderColorMap, theme } = options;
    const label = node.name || '';
    const isActive = activeNodeSlug === node.slug;
    const isHover = hoverNodeId === node.id;
    const isFolder = !!node.isFolder;
    const baseColor = folderColorMap[node.folderId ?? ''] || '#8b5cf6';
    const isDark =
      theme === 'dark' ||
      (theme === 'system' &&
        typeof document !== 'undefined' &&
        document.documentElement.classList.contains('dark'));

    const radius = isFolder
      ? Math.sqrt(node.val || 10) * 4.5
      : Math.sqrt(node.val || 1) * 3;

    const focused = isActive || isHover;
    ctx.save();

    // -- Node circle --
    ctx.beginPath();
    ctx.arc(node.x!, node.y!, radius, 0, Math.PI * 2);

    if (isFolder) {
      ctx.fillStyle = isDark ? '#f8fafc' : '#0f172a';
    } else {
      ctx.fillStyle = baseColor;
    }
    ctx.globalAlpha = focused ? 1 : 0.85;
    ctx.fill();

    // -- Node border --
    if (focused || isFolder) {
      ctx.lineWidth = focused ? 2.5 / globalScale : 1 / globalScale;
      ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.9)' : 'rgba(15,23,42,0.9)';
      ctx.stroke();
    }

    ctx.restore();

    // -- Label --
    const showLabel = isFolder || focused || globalScale > 0.8;
    if (showLabel) {
      renderLabel(node, ctx, globalScale, {
        label,
        isFolder,
        focused,
        isDark,
        radius,
      });
    }
  } catch {
    /* suppress Canvas API errors during warmup */
  }
}

interface LabelOptions {
  label: string;
  isFolder: boolean;
  focused: boolean;
  isDark: boolean;
  radius: number;
}

function renderLabel(
  node: NodeRuntime,
  ctx: CanvasRenderingContext2D,
  globalScale: number,
  opts: LabelOptions
): void {
  const { label, isFolder, focused, isDark, radius } = opts;
  const rawSize = isFolder ? 12 / globalScale : 10 / globalScale;
  const labelSize = Math.max(rawSize, 8);
  const clampedSize = Math.min(labelSize, 14);

  ctx.font = `${isFolder ? '700' : '600'} ${clampedSize}px "Inter", "SF Pro Display", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const maxChars = focused ? 30 : isFolder ? 20 : 14;
  const displayLabel =
    label.length > maxChars ? label.slice(0, maxChars - 1) + '...' : label;

  const textW = ctx.measureText(displayLabel).width;
  const textH = clampedSize;
  const padX = 6 / globalScale;
  const padY = 3 / globalScale;
  const textY = node.y! + radius + (8 + textH * 0.5) / globalScale;

  const pillX = node.x! - textW / 2 - padX;
  const pillY2 = textY - textH / 2 - padY;
  const pillW = textW + padX * 2;
  const pillH = textH + padY * 2;
  const pillR = Math.min(4 / globalScale, textH / 2);

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(pillX, pillY2, pillW, pillH, pillR);

  if (isDark) {
    ctx.fillStyle = focused ? 'rgba(30, 41, 59, 1)' : 'rgba(15, 23, 42, 0.8)';
    ctx.strokeStyle = focused ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)';
  } else {
    ctx.fillStyle = focused ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 0.8)';
    ctx.strokeStyle = focused ? 'rgba(15, 23, 42, 0.2)' : 'rgba(15, 23, 42, 0.05)';
  }

  if (!isDark) {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
    ctx.shadowBlur = 6 / globalScale;
    ctx.shadowOffsetY = 2 / globalScale;
  }

  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.lineWidth = 1 / globalScale;
  ctx.stroke();
  ctx.restore();

  if (isDark) {
    ctx.fillStyle = focused ? '#ffffff' : isFolder ? '#f8fafc' : '#cbd5e1';
  } else {
    ctx.fillStyle = focused ? '#0f172a' : isFolder ? '#1e293b' : '#334155';
  }
  ctx.fillText(displayLabel, node.x!, textY);
}

/** ForceGraph2D의 nodePointerAreaPaint 콜백 - 클릭/호버 판정용 히트 영역 렌더링 */
export function renderNodeHitArea(
  node: NodeRuntime,
  color: string,
  ctx: CanvasRenderingContext2D,
  globalScale: number
): void {
  if (node.x == null || node.y == null || !isFinite(node.x) || !isFinite(node.y)) return;
  const r = node.isFolder
    ? Math.sqrt(node.val || 10) * 3.5
    : Math.sqrt(node.val || 1) * 2.5;
  const hitR = r + 12 / globalScale;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(node.x!, node.y!, hitR, 0, Math.PI * 2);
  ctx.fill();
}
