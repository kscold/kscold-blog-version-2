import type { NodeRuntime } from './graphForceTypes';
import { getHitRadius } from './graphForceUtils';

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
