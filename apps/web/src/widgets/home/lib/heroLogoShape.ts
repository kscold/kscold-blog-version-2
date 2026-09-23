/**
 * 블로그 로고(육각 눈꽃 + K)를 선분 목록으로 옮긴 것.
 *
 * public/logo.svg 와 같은 좌표계(가운데가 원점, viewBox 120)를 쓴다. 정적 SVG 와
 * three.js 입체 로고가 같은 데이터를 읽어서, 입체 로고가 늦게 떠도 모양과 자리가
 * 어긋나지 않는다.
 */

export const HERO_LOGO_VIEWBOX = 120;

export type LogoSegmentRole = 'frame' | 'spike' | 'fork' | 'crystal' | 'letter';

export interface LogoSegment {
  from: readonly [number, number];
  to: readonly [number, number];
  /** SVG 선 굵기 */
  width: number;
  /** SVG 에서의 불투명도 */
  opacity?: number;
  /** 입체 로고에서 양 끝이 앞으로 나온 정도(월드 단위). 기본은 평면 */
  depth?: readonly [number, number];
  role: LogoSegmentRole;
}

const HEX: ReadonlyArray<readonly [number, number]> = [
  [0, -42],
  [36.4, -21],
  [36.4, 21],
  [0, 42],
  [-36.4, 21],
  [-36.4, -21],
];

const frame: LogoSegment[] = HEX.map((point, index) => ({
  from: point,
  to: HEX[(index + 1) % HEX.length],
  width: 3,
  role: 'frame',
}));

const spikes: LogoSegment[] = (
  [
    [[0, -42], [0, -52]],
    [[36.4, -21], [45, -26]],
    [[36.4, 21], [45, 26]],
    [[0, 42], [0, 52]],
    [[-36.4, 21], [-45, 26]],
    [[-36.4, -21], [-45, -26]],
  ] as const
).map(([from, to]) => ({ from, to, width: 2.2, role: 'spike' as const }));

// 가지 끝은 살짝 뒤로 젖혀서, 돌렸을 때 눈꽃이 평면이 아니라 입체로 보이게 한다.
const forks: LogoSegment[] = (
  [
    [[0, -48], [-4, -44]],
    [[0, -48], [4, -44]],
    [[42, -24], [38, -27.5]],
    [[42, -24], [42.5, -19]],
    [[42, 24], [42.5, 19]],
    [[42, 24], [38, 27.5]],
    [[0, 48], [-4, 44]],
    [[0, 48], [4, 44]],
    [[-42, 24], [-38, 27.5]],
    [[-42, 24], [-42.5, 19]],
    [[-42, -24], [-42.5, -19]],
    [[-42, -24], [-38, -27.5]],
  ] as const
).map(([from, to]) => ({
  from,
  to,
  width: 1.4,
  opacity: 0.6,
  depth: [0, -0.14] as const,
  role: 'fork' as const,
}));

// 결정 안쪽 보조선. 평면 SVG 에서만 그리고 입체에서는 뺀다.
const crystal: LogoSegment[] = (
  [
    [[0, -42], [0, -20], 0.15],
    [[0, 42], [0, 20], 0.15],
    [[-36.4, -21], [-18, -10], 0.15],
    [[36.4, -21], [18, -10], 0.12],
    [[-36.4, 21], [-18, 10], 0.15],
    [[36.4, 21], [18, 10], 0.12],
  ] as const
).map(([from, to, opacity]) => ({ from, to, width: 1, opacity, role: 'crystal' as const }));

// K 는 육각 틀보다 앞으로 띄운다. 팔 끝은 꼭짓점에 붙어 있어야 하므로 바깥쪽 끝만 틀과 같은 깊이에 둔다.
const letter: LogoSegment[] = [
  { from: [-16, -18], to: [-16, 18], width: 3.2, depth: [0.32, 0.32], role: 'letter' },
  { from: [4, 0], to: [36.4, -21], width: 5, depth: [0.32, 0], role: 'letter' },
  { from: [4, 0], to: [36.4, 21], width: 5, depth: [0.32, 0], role: 'letter' },
];

export const HERO_LOGO_SEGMENTS: readonly LogoSegment[] = [
  ...frame,
  ...spikes,
  ...forks,
  ...crystal,
  ...letter,
];
