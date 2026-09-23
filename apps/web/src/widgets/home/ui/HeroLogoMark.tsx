import { HERO_LOGO_SEGMENTS, HERO_LOGO_VIEWBOX } from '../lib/heroLogoShape';

interface HeroLogoMarkProps {
  className?: string;
}

/**
 * 입체 로고가 뜨기 전에, 그리고 움직임을 줄인 환경에서 대신 보여줄 평면 로고.
 * 입체 로고와 같은 선분 데이터를 써서 모양이 똑같다.
 */
export function HeroLogoMark({ className }: HeroLogoMarkProps) {
  const half = HERO_LOGO_VIEWBOX / 2;
  return (
    <svg
      viewBox={`${-half} ${-half} ${HERO_LOGO_VIEWBOX} ${HERO_LOGO_VIEWBOX}`}
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="hero-logo-ink" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="55%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>
      </defs>
      <g stroke="url(#hero-logo-ink)" strokeLinecap="round" strokeLinejoin="round">
        {HERO_LOGO_SEGMENTS.map((segment, index) => (
          <line
            key={index}
            x1={segment.from[0]}
            y1={segment.from[1]}
            x2={segment.to[0]}
            y2={segment.to[1]}
            strokeWidth={segment.width}
            opacity={segment.opacity}
          />
        ))}
      </g>
    </svg>
  );
}
