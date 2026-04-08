import type { GraphLink, GraphNode } from '@/types/vault';

interface RenderGraphLinkOptions {
  hoverNode: GraphNode | null;
  folderColorMap: Record<string, string>;
  reducedEffects?: boolean;
}

export function renderGraphLink(
  link: GraphLink,
  ctx: CanvasRenderingContext2D,
  { hoverNode, folderColorMap, reducedEffects = false }: RenderGraphLinkOptions
) {
  const src = link.source;
  const tgt = link.target;

  if (typeof src !== 'object' || typeof tgt !== 'object') return;
  if (src.x == null || src.y == null || tgt.x == null || tgt.y == null) return;
  if (!isFinite(src.x) || !isFinite(src.y) || !isFinite(tgt.x) || !isFinite(tgt.y)) return;

  const srcNode = src as GraphNode;
  const tgtNode = tgt as GraphNode;
  const isHovered = Boolean(hoverNode && (srcNode.id === hoverNode.id || tgtNode.id === hoverNode.id));
  const srcColor = folderColorMap[srcNode.folderId ?? ''] || '#64C8FF';
  const tgtColor = folderColorMap[tgtNode.folderId ?? ''] || srcColor;

  if (reducedEffects) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(src.x, src.y);
    ctx.lineTo(tgt.x, tgt.y);
    ctx.strokeStyle = isHovered ? `${srcColor}aa` : `${srcColor}44`;
    ctx.lineWidth = isHovered ? 1.6 : 0.9;
    ctx.stroke();
    ctx.restore();
    return;
  }

  const dx = tgt.x - src.x;
  const dy = tgt.y - src.y;
  const length = Math.sqrt(dx * dx + dy * dy) || 1;
  const curve = length * 0.18;
  const controlX = (src.x + tgt.x) / 2 - (dy / length) * curve;
  const controlY = (src.y + tgt.y) / 2 + (dx / length) * curve;

  ctx.save();

  if (isHovered) {
    ctx.beginPath();
    ctx.moveTo(src.x, src.y);
    ctx.quadraticCurveTo(controlX, controlY, tgt.x, tgt.y);
    ctx.strokeStyle = `${srcColor}40`;
    ctx.lineWidth = 10;
    ctx.shadowColor = srcColor;
    ctx.shadowBlur = 20;
    ctx.stroke();

    const gradient = ctx.createLinearGradient(src.x, src.y, tgt.x, tgt.y);
    gradient.addColorStop(0, `${srcColor}ee`);
    gradient.addColorStop(1, `${tgtColor}ee`);
    ctx.beginPath();
    ctx.moveTo(src.x, src.y);
    ctx.quadraticCurveTo(controlX, controlY, tgt.x, tgt.y);
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 2;
    ctx.shadowColor = srcColor;
    ctx.shadowBlur = 8;
    ctx.stroke();
  } else {
    const gradient = ctx.createLinearGradient(src.x, src.y, tgt.x, tgt.y);
    gradient.addColorStop(0, `${srcColor}55`);
    gradient.addColorStop(0.5, `${srcColor}33`);
    gradient.addColorStop(1, `${tgtColor}55`);
    ctx.beginPath();
    ctx.moveTo(src.x, src.y);
    ctx.quadraticCurveTo(controlX, controlY, tgt.x, tgt.y);
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  ctx.restore();
}

export function resolveLinkParticleColor(
  link: GraphLink,
  nodes: GraphNode[],
  folderColorMap: Record<string, string>
) {
  const sourceNode = typeof link.source === 'object' ? link.source : null;
  const sourceId = typeof link.source === 'string' ? link.source : link.source?.id;
  const folderId = sourceNode?.folderId || nodes.find(node => node.id === sourceId)?.folderId;

  return folderColorMap[folderId ?? ''] || '#64C8FF';
}
