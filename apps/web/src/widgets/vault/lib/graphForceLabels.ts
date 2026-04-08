import type { LabelOptions, NodeRuntime } from './graphForceTypes';

export function renderGraphLabel(
  node: NodeRuntime,
  ctx: CanvasRenderingContext2D,
  globalScale: number,
  options: LabelOptions
): void {
  const { label, isFolder, focused, isDark, radius, nodeColor } = options;
  const rawSize = isFolder ? 12 / globalScale : 10 / globalScale;
  const clampedSize = Math.min(Math.max(rawSize, 8), 14);
  const maxChars = focused ? 30 : isFolder ? 20 : 14;
  const displayLabel =
    label.length > maxChars ? `${label.slice(0, maxChars - 1)}…` : label;

  ctx.font = `${isFolder ? '700' : '500'} ${clampedSize}px "Inter", "SF Pro Display", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const textWidth = ctx.measureText(displayLabel).width;
  const textHeight = clampedSize;
  const paddingX = 7 / globalScale;
  const paddingY = 3.5 / globalScale;
  const textY = node.y! + radius + (10 + textHeight * 0.5) / globalScale;

  const pillX = node.x! - textWidth / 2 - paddingX;
  const pillY = textY - textHeight / 2 - paddingY;
  const pillWidth = textWidth + paddingX * 2;
  const pillHeight = textHeight + paddingY * 2;
  const pillRadius = Math.min(5 / globalScale, textHeight / 2);

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(pillX, pillY, pillWidth, pillHeight, pillRadius);

  if (isDark) {
    ctx.fillStyle = focused
      ? 'rgba(15, 23, 42, 0.95)'
      : isFolder
        ? 'rgba(15, 23, 42, 0.85)'
        : 'rgba(2, 6, 23, 0.75)';
    ctx.strokeStyle = focused
      ? `${nodeColor}99`
      : isFolder
        ? `${nodeColor}44`
        : 'rgba(255,255,255,0.08)';
  } else {
    ctx.fillStyle = focused ? 'rgba(255,255,255,0.98)' : 'rgba(255,255,255,0.88)';
    ctx.strokeStyle = focused ? `${nodeColor}aa` : 'rgba(15,23,42,0.08)';
    ctx.shadowColor = 'rgba(0,0,0,0.12)';
    ctx.shadowBlur = 5 / globalScale;
    ctx.shadowOffsetY = 2 / globalScale;
  }

  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.lineWidth = 1 / globalScale;
  ctx.stroke();
  ctx.restore();

  ctx.save();
  if (focused) {
    ctx.shadowColor = nodeColor;
    ctx.shadowBlur = 6;
  }
  ctx.fillStyle = isDark
    ? focused
      ? '#ffffff'
      : isFolder
        ? nodeColor
        : '#94a3b8'
    : focused
      ? '#0f172a'
      : isFolder
        ? '#1e293b'
        : '#475569';
  ctx.font = `${isFolder ? '700' : '500'} ${clampedSize}px "Inter", "SF Pro Display", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(displayLabel, node.x!, textY);
  ctx.restore();
}
