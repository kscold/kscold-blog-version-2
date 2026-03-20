const NODE_W = 110;
const NODE_H = 42;
const GAP_X = 20;

const ROW2_COUNT = 5;
const TOTAL_ROW2_W = ROW2_COUNT * NODE_W + (ROW2_COUNT - 1) * GAP_X;
const START_X = (TOTAL_ROW2_W - NODE_W) / 2;

const DEPT_GAP = 40;
const DEPT_TOTAL_W = 3 * NODE_W + 2 * DEPT_GAP;
const DEPT_START_X = (TOTAL_ROW2_W - DEPT_TOTAL_W) / 2;

const NODES = [
  { id: 'ceo', x: START_X, y: 10, label: '승찬', sub: 'CTO', color: '#1e293b' },
  { id: 'product', x: DEPT_START_X, y: 90, label: 'Product', sub: '', color: '#d97706' },
  { id: 'engineering', x: DEPT_START_X + NODE_W + DEPT_GAP, y: 90, label: 'Engineering', sub: '', color: '#2563eb' },
  { id: 'design', x: DEPT_START_X + 2 * (NODE_W + DEPT_GAP), y: 90, label: 'Design', sub: '', color: '#db2777' },
  { id: 'pm', x: 0, y: 170, label: '용찬', sub: 'PM', color: '#d97706' },
  { id: 'se', x: NODE_W + GAP_X, y: 170, label: '태호', sub: 'Tech Lead', color: '#7c3aed' },
  { id: 'pe', x: 2 * (NODE_W + GAP_X), y: 170, label: '가원', sub: 'Platform', color: '#2563eb' },
  { id: 'fe', x: 3 * (NODE_W + GAP_X), y: 170, label: '희영', sub: 'Frontend', color: '#7c3aed' },
  { id: 'ds', x: 4 * (NODE_W + GAP_X), y: 170, label: '은진', sub: 'Designer', color: '#db2777' },
];

const EDGES: [string, string][] = [
  ['ceo', 'product'], ['ceo', 'engineering'], ['ceo', 'design'],
  ['product', 'pm'], ['engineering', 'pm'],
  ['product', 'se'], ['engineering', 'se'],
  ['engineering', 'pe'],
  ['engineering', 'fe'], ['design', 'fe'],
  ['design', 'ds'],
];

const NODE_MAP = Object.fromEntries(NODES.map(n => [n.id, n]));
const SVG_W = TOTAL_ROW2_W + 20;

export function OrgChart() {
  return (
    <svg viewBox={`-10 0 ${SVG_W} 225`} className="w-full" preserveAspectRatio="xMidYMid meet">
      {EDGES.map(([from, to]) => {
        const a = NODE_MAP[from];
        const b = NODE_MAP[to];
        const x1 = a.x + NODE_W / 2;
        const y1 = a.y + NODE_H;
        const x2 = b.x + NODE_W / 2;
        const y2 = b.y;
        const midY = (y1 + y2) / 2;
        return (
          <path
            key={`${from}-${to}`}
            d={`M${x1},${y1} L${x1},${midY} L${x2},${midY} L${x2},${y2}`}
            fill="none"
            stroke="#d1d5db"
            strokeWidth={1.5}
          />
        );
      })}
      {NODES.map(n => (
        <g key={n.id}>
          <rect x={n.x} y={n.y} width={NODE_W} height={NODE_H} rx={10} fill={n.color} />
          <text x={n.x + NODE_W / 2} y={n.y + (n.sub ? 17 : 25)} textAnchor="middle" fill="white" fontSize={11} fontWeight={700} fontFamily="Pretendard, sans-serif">
            {n.label}
          </text>
          {n.sub && (
            <text x={n.x + NODE_W / 2} y={n.y + 32} textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize={9} fontFamily="Pretendard, sans-serif">
              {n.sub}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}
