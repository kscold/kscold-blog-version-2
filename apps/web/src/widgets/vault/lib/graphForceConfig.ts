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

export function configureForces({ fg, nodeCount }: ConfigureForcesOptions): void {
  // Obsidian처럼: 노드 수에 따라 동적 조절
  const isSparse = nodeCount <= 10;
  const isMedium = nodeCount <= 50;

  // 척력: 적은 노드일수록 강하게 밀어서 자연스러운 배치
  const chargeStrength = isSparse ? -400 : isMedium ? -250 : -150;

  // 링크 길이: 허브-자식은 짧게, 많을수록 촘촘하게
  const linkDist = isSparse ? 160 : isMedium ? 90 : 60;

  fg.d3Force('charge')?.strength(chargeStrength).distanceMax(600);
  fg.d3Force('link')?.distance(linkDist).strength(isSparse ? 0.3 : 0.5);

  // 충돌 반경: 노드 크기에 맞게 + 여백
  fg.d3Force(
    'collision',
    forceCollide()
      .radius((datum: SimulationNodeDatum) => {
        const node = datum as NodeRuntime;
        const r = node.isFolder
          ? Math.sqrt(node.val || 10) * 4.5
          : Math.sqrt(node.val || 4) * 3;
        return r + (isSparse ? 20 : 8);
      })
      .strength(0.85)
      .iterations(2)
  );

  // 중심력: 약하게 → 더 퍼져서 자연스러운 느낌
  fg.d3Force('center')?.strength(isSparse ? 0.05 : 0.02);
  fg.d3ReheatSimulation();
}

interface RenderNodeOptions {
  activeNodeSlug?: string;
  hoverNodeId?: string;
  folderColorMap: Record<string, string>;
  theme: 'light' | 'dark' | 'system';
}

export function renderNode(
  node: NodeRuntime,
  ctx: CanvasRenderingContext2D,
  globalScale: number,
  options: RenderNodeOptions
): void {
  if (node.x == null || node.y == null || !isFinite(node.x) || !isFinite(node.y)) return;

  try {
    const { activeNodeSlug, hoverNodeId, folderColorMap, theme } = options;
    const isActive = activeNodeSlug === node.slug;
    const isHover = hoverNodeId === node.id;
    const isFolder = !!node.isFolder;
    const focused = isActive || isHover;

    const isDark =
      theme === 'dark' ||
      (theme === 'system' &&
        typeof document !== 'undefined' &&
        document.documentElement.classList.contains('dark'));

    const nodeColor = folderColorMap[node.folderId ?? ''] || '#64C8FF';
    const radius = isFolder
      ? Math.sqrt(node.val || 10) * 4.5
      : Math.sqrt(node.val || 1) * 3;
    const x = node.x!;
    const y = node.y!;

    ctx.save();

    // ── 외부 헤일로 링 (folder) ─────────────────────────────────────
    if (isFolder) {
      ctx.beginPath();
      ctx.arc(x, y, radius * 1.7, 0, Math.PI * 2);
      ctx.strokeStyle = nodeColor;
      ctx.lineWidth = 0.8 / globalScale;
      ctx.globalAlpha = focused ? 0.18 : 0.07;
      ctx.shadowColor = nodeColor;
      ctx.shadowBlur = 8;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(x, y, radius * 1.25, 0, Math.PI * 2);
      ctx.strokeStyle = nodeColor;
      ctx.lineWidth = (focused ? 1.2 : 0.6) / globalScale;
      ctx.globalAlpha = focused ? 0.4 : 0.16;
      ctx.shadowBlur = 5;
      ctx.stroke();
    }

    if (focused) {
      ctx.beginPath();
      ctx.arc(x, y, radius * 1.12, 0, Math.PI * 2);
      ctx.strokeStyle = nodeColor;
      ctx.lineWidth = 1 / globalScale;
      ctx.globalAlpha = 0.5;
      ctx.shadowColor = nodeColor;
      ctx.shadowBlur = 10;
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    // ── 글로우 레이어 (부드럽게) ────────────────────────────────────
    const glowRadius = radius * (isFolder ? 1.5 : 1.3);
    const glowGrad = ctx.createRadialGradient(x, y, radius * 0.6, x, y, glowRadius);
    glowGrad.addColorStop(0, nodeColor + (isDark ? '28' : '14'));
    glowGrad.addColorStop(1, nodeColor + '00');
    ctx.beginPath();
    ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
    ctx.fillStyle = glowGrad;
    ctx.globalAlpha = focused ? 0.9 : 0.55;
    ctx.fill();

    // ── 메인 노드 원 (부드러운 그라디언트) ─────────────────────────
    ctx.globalAlpha = focused ? 0.95 : 0.82;
    ctx.shadowColor = nodeColor;
    ctx.shadowBlur = focused ? (isFolder ? 14 : 10) : (isFolder ? 8 : 4);

    const mainGrad = ctx.createRadialGradient(
      x - radius * 0.25, y - radius * 0.25, 0,
      x, y, radius
    );

    if (isFolder) {
      // 폴더: 반투명 색상 (너무 진하지 않게)
      mainGrad.addColorStop(0, isDark ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.85)');
      mainGrad.addColorStop(0.4, nodeColor + 'bb');
      mainGrad.addColorStop(1, nodeColor + '77');
    } else {
      // 노트: 더 연하게
      mainGrad.addColorStop(0, isDark ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.8)');
      mainGrad.addColorStop(0.5, nodeColor + '99');
      mainGrad.addColorStop(1, nodeColor + '66');
    }

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = mainGrad;
    ctx.fill();

    // ── 테두리 ──────────────────────────────────────────────────────
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    if (focused) {
      ctx.strokeStyle = nodeColor + 'cc';
      ctx.lineWidth = 1.2 / globalScale;
      ctx.globalAlpha = 0.85;
    } else if (isFolder) {
      ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.22)' : nodeColor + '44';
      ctx.lineWidth = 0.7 / globalScale;
      ctx.globalAlpha = 1;
    } else {
      ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.1)' : nodeColor + '22';
      ctx.lineWidth = 0.4 / globalScale;
      ctx.globalAlpha = 1;
    }
    ctx.stroke();

    // ── 하이라이트 점 (3D feel, 약하게) ────────────────────────────
    const shineR = radius * 0.25;
    const shineGrad = ctx.createRadialGradient(
      x - radius * 0.28, y - radius * 0.28, 0,
      x - radius * 0.28, y - radius * 0.28, shineR
    );
    shineGrad.addColorStop(0, 'rgba(255,255,255,0.5)');
    shineGrad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.beginPath();
    ctx.arc(x - radius * 0.28, y - radius * 0.28, shineR, 0, Math.PI * 2);
    ctx.fillStyle = shineGrad;
    ctx.globalAlpha = 0.45;
    ctx.fill();

    ctx.restore();

    // ── 라벨 ────────────────────────────────────────────────────────
    const showLabel = isFolder || focused || globalScale > 0.8;
    if (showLabel) {
      renderLabel(node, ctx, globalScale, {
        label: node.name || '',
        isFolder,
        focused,
        isDark,
        radius,
        nodeColor,
      });
    }
  } catch {
    /* Canvas API 워밍업 중 에러 억제 */
  }
}

interface LabelOptions {
  label: string;
  isFolder: boolean;
  focused: boolean;
  isDark: boolean;
  radius: number;
  nodeColor: string;
}

function renderLabel(
  node: NodeRuntime,
  ctx: CanvasRenderingContext2D,
  globalScale: number,
  opts: LabelOptions
): void {
  const { label, isFolder, focused, isDark, radius, nodeColor } = opts;
  const rawSize = isFolder ? 12 / globalScale : 10 / globalScale;
  const clampedSize = Math.min(Math.max(rawSize, 8), 14);

  ctx.font = `${isFolder ? '700' : '500'} ${clampedSize}px "Inter", "SF Pro Display", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const maxChars = focused ? 30 : isFolder ? 20 : 14;
  const displayLabel = label.length > maxChars ? label.slice(0, maxChars - 1) + '…' : label;

  const textW = ctx.measureText(displayLabel).width;
  const textH = clampedSize;
  const padX = 7 / globalScale;
  const padY = 3.5 / globalScale;
  const textY = node.y! + radius + (10 + textH * 0.5) / globalScale;

  const pillX = node.x! - textW / 2 - padX;
  const pillY = textY - textH / 2 - padY;
  const pillW = textW + padX * 2;
  const pillH = textH + padY * 2;
  const pillR = Math.min(5 / globalScale, textH / 2);

  ctx.save();

  // 라벨 배경
  ctx.beginPath();
  ctx.roundRect(pillX, pillY, pillW, pillH, pillR);

  if (isDark) {
    ctx.fillStyle = focused
      ? 'rgba(15, 23, 42, 0.95)'
      : isFolder
        ? 'rgba(15, 23, 42, 0.85)'
        : 'rgba(2, 6, 23, 0.75)';
    ctx.strokeStyle = focused
      ? nodeColor + '99'
      : isFolder
        ? nodeColor + '44'
        : 'rgba(255,255,255,0.08)';
  } else {
    ctx.fillStyle = focused ? 'rgba(255,255,255,0.98)' : 'rgba(255,255,255,0.88)';
    ctx.strokeStyle = focused ? nodeColor + 'aa' : 'rgba(15,23,42,0.08)';
    ctx.shadowColor = 'rgba(0,0,0,0.12)';
    ctx.shadowBlur = 5 / globalScale;
    ctx.shadowOffsetY = 2 / globalScale;
  }

  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.lineWidth = 1 / globalScale;
  ctx.stroke();
  ctx.restore();

  // 라벨 텍스트
  ctx.save();
  if (focused) {
    ctx.shadowColor = nodeColor;
    ctx.shadowBlur = 6;
  }
  if (isDark) {
    ctx.fillStyle = focused ? '#ffffff' : isFolder ? nodeColor : '#94a3b8';
  } else {
    ctx.fillStyle = focused ? '#0f172a' : isFolder ? '#1e293b' : '#475569';
  }
  ctx.font = `${isFolder ? '700' : '500'} ${clampedSize}px "Inter", "SF Pro Display", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(displayLabel, node.x!, textY);
  ctx.restore();
}

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
