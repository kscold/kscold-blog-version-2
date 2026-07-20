'use client';

export interface Ripple {
  id: number;
  x: number;
  y: number;
  color: string;
}

interface VaultGraphRipplesProps {
  ripples: Ripple[];
}

// 노드 클릭 리플 — 클릭 지점에서 폴더 컬러 파동이 한 번 퍼짐
export function VaultGraphRipples({ ripples }: VaultGraphRipplesProps) {
  return (
    <>
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          aria-hidden="true"
          className="absolute z-10 pointer-events-none rounded-full animate-vault-ripple"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: 14,
            height: 14,
            marginLeft: -7,
            marginTop: -7,
            border: `2px solid ${ripple.color}`,
            boxShadow: `0 0 18px ${ripple.color}66`,
          }}
        />
      ))}
    </>
  );
}
