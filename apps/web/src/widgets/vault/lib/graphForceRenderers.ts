import type { RenderNodeOptions, NodeRuntime } from './graphForceTypes';
import { renderGraphLabel } from './graphForceLabels';
import { getHitRadius, getNodeRadius, isDarkGraphTheme } from './graphForceUtils';

function renderReducedNode(
  node: NodeRuntime,
  ctx: CanvasRenderingContext2D,
  globalScale: number,
  focused: boolean,
  isFolder: boolean,
  nodeColor: string,
  radius: number
) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(node.x!, node.y!, radius, 0, Math.PI * 2);
  ctx.fillStyle = nodeColor;
  ctx.globalAlpha = focused ? 0.92 : isFolder ? 0.8 : 0.68;
  ctx.fill();

  if (focused || isFolder) {
    ctx.beginPath();
    ctx.arc(node.x!, node.y!, radius, 0, Math.PI * 2);
    ctx.strokeStyle = focused ? `${nodeColor}cc` : `${nodeColor}55`;
    ctx.lineWidth = (focused ? 1 : 0.6) / globalScale;
    ctx.globalAlpha = focused ? 0.95 : 0.8;
    ctx.stroke();
  }

  ctx.restore();
}

function renderDetailedNode(
  node: NodeRuntime,
  ctx: CanvasRenderingContext2D,
  globalScale: number,
  focused: boolean,
  isFolder: boolean,
  isDark: boolean,
  nodeColor: string,
  radius: number
) {
  const x = node.x!;
  const y = node.y!;

  ctx.save();

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

  const glowRadius = radius * (isFolder ? 1.5 : 1.3);
  const glowGradient = ctx.createRadialGradient(x, y, radius * 0.6, x, y, glowRadius);
  glowGradient.addColorStop(0, `${nodeColor}${isDark ? '28' : '14'}`);
  glowGradient.addColorStop(1, `${nodeColor}00`);
  ctx.beginPath();
  ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
  ctx.fillStyle = glowGradient;
  ctx.globalAlpha = focused ? 0.9 : 0.55;
  ctx.fill();

  ctx.globalAlpha = focused ? 0.95 : 0.82;
  ctx.shadowColor = nodeColor;
  ctx.shadowBlur = focused ? (isFolder ? 14 : 10) : isFolder ? 8 : 4;

  const mainGradient = ctx.createRadialGradient(x - radius * 0.25, y - radius * 0.25, 0, x, y, radius);
  if (isFolder) {
    mainGradient.addColorStop(0, isDark ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.85)');
    mainGradient.addColorStop(0.4, `${nodeColor}bb`);
    mainGradient.addColorStop(1, `${nodeColor}77`);
  } else {
    mainGradient.addColorStop(0, isDark ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.8)');
    mainGradient.addColorStop(0.5, `${nodeColor}99`);
    mainGradient.addColorStop(1, `${nodeColor}66`);
  }

  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = mainGradient;
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  if (focused) {
    ctx.strokeStyle = `${nodeColor}cc`;
    ctx.lineWidth = 1.2 / globalScale;
    ctx.globalAlpha = 0.85;
  } else if (isFolder) {
    ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.22)' : `${nodeColor}44`;
    ctx.lineWidth = 0.7 / globalScale;
    ctx.globalAlpha = 1;
  } else {
    ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.1)' : `${nodeColor}22`;
    ctx.lineWidth = 0.4 / globalScale;
    ctx.globalAlpha = 1;
  }
  ctx.stroke();

  const shineRadius = radius * 0.25;
  const shineGradient = ctx.createRadialGradient(
    x - radius * 0.28,
    y - radius * 0.28,
    0,
    x - radius * 0.28,
    y - radius * 0.28,
    shineRadius
  );
  shineGradient.addColorStop(0, 'rgba(255,255,255,0.5)');
  shineGradient.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.beginPath();
  ctx.arc(x - radius * 0.28, y - radius * 0.28, shineRadius, 0, Math.PI * 2);
  ctx.fillStyle = shineGradient;
  ctx.globalAlpha = 0.45;
  ctx.fill();

  ctx.restore();
}

export function renderNode(
  node: NodeRuntime,
  ctx: CanvasRenderingContext2D,
  globalScale: number,
  options: RenderNodeOptions
): void {
  if (node.x == null || node.y == null || !isFinite(node.x) || !isFinite(node.y)) return;

  try {
    const { activeNodeSlug, hoverNodeId, folderColorMap, theme, reducedEffects = false } = options;
    const isFolder = Boolean(node.isFolder);
    const focused = activeNodeSlug === node.slug || hoverNodeId === node.id;
    const isDark = isDarkGraphTheme(theme);
    const nodeColor = folderColorMap[node.folderId ?? ''] || '#64C8FF';
    const radius = getNodeRadius(node);

    if (reducedEffects) {
      renderReducedNode(node, ctx, globalScale, focused, isFolder, nodeColor, radius);
    } else {
      renderDetailedNode(node, ctx, globalScale, focused, isFolder, isDark, nodeColor, radius);
    }

    if (isFolder || focused || globalScale > (reducedEffects ? 1.15 : 0.8)) {
      renderGraphLabel(node, ctx, globalScale, {
        label: node.name || '',
        isFolder,
        focused,
        isDark,
        radius,
        nodeColor,
      });
    }
  } catch {
    // Canvas warm-up errors can occur briefly while the graph mounts.
  }
}

export function renderNodeHitArea(
  node: NodeRuntime,
  color: string,
  ctx: CanvasRenderingContext2D,
  globalScale: number
): void {
  if (node.x == null || node.y == null || !isFinite(node.x) || !isFinite(node.y)) return;

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(node.x!, node.y!, getHitRadius(node) + 12 / globalScale, 0, Math.PI * 2);
  ctx.fill();
}
