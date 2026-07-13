import type { ForceGraphMethods } from 'react-force-graph-2d';
import { isDarkGraphTheme } from './graphForceUtils';

export interface ParallaxStar {
  x: number;
  y: number;
  r: number;
  baseAlpha: number;
  /** 패럴랙스 팩터 — 작을수록 멀리 있는 별처럼 천천히 움직인다 */
  p: number;
  tw: number;
  ph: number;
}

// ── 패럴랙스 별 필드 ──
// 그래프와 같은 캔버스에서, 카메라 이동에 노드보다 "느리게" 반응하는 별을 그린다.
// 팬/줌할 때 별이 천천히 비켜나며 원근감이 생긴다 (배경이 벽지가 아니라 먼 우주가 됨).
export function createStarfield(reducedEffects: boolean): ParallaxStar[] {
  const count = reducedEffects ? 40 : 90;
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
  return stars;
}

export interface RenderStarfieldOptions {
  fg: ForceGraphMethods;
  stars: ParallaxStar[];
  theme: 'light' | 'dark' | 'system';
  isGraphHovered: boolean;
  reducedEffects: boolean;
  mouse: { x: number; y: number };
  supportsHover: boolean;
}

export function renderStarfield(
  ctx: CanvasRenderingContext2D,
  globalScale: number,
  { fg, stars, theme, isGraphHovered, reducedEffects, mouse, supportsHover }: RenderStarfieldOptions
): void {
  const center = fg.centerAt() as { x: number; y: number };
  if (!center || !isFinite(center.x) || !isFinite(center.y)) return;

  const isDark = isDarkGraphTheme(theme);
  const t = isGraphHovered ? performance.now() / 1000 : 0;

  // 마우스 기울임 시차 — 가까운 별(p 큼)일수록 커서 반대편으로 더 크게 밀린다
  const tiltX = supportsHover ? mouse.x : 0;
  const tiltY = supportsHover ? mouse.y : 0;

  ctx.save();
  ctx.fillStyle = isDark ? '#cbd5e1' : '#64748b';
  for (const star of stars) {
    // 카메라 이동량의 (1-p)만큼 별을 따라 보정 → 화면상 p배 속도로만 움직임
    const tiltShift = (star.p * 26) / globalScale;
    const wx = star.x + center.x * (1 - star.p) - tiltX * tiltShift;
    const wy = star.y + center.y * (1 - star.p) - tiltY * tiltShift;
    const r = star.r / globalScale; // 줌과 무관하게 화면 크기 고정
    const twinkle = reducedEffects ? 1 : 0.7 + 0.3 * Math.sin(t * star.tw + star.ph);
    ctx.globalAlpha = star.baseAlpha * twinkle;
    ctx.beginPath();
    ctx.arc(wx, wy, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
