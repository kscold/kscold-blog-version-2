'use client';

interface VaultGraphBackdropProps {
  reducedGraphEffects: boolean;
  isGraphHovered: boolean;
}

// ── 화이트 우주 배경 (순수 CSS — 캔버스 성능 영향 없음) ──
export function VaultGraphBackdrop({ reducedGraphEffects, isGraphHovered }: VaultGraphBackdropProps) {
  return (
    <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
      {/* 중앙 광원: 종이 위에 빛이 고이는 듯한 깊이감 */}
      <div
        className="absolute inset-0 dark:opacity-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 70% at 50% 45%, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.4) 55%, rgba(226,232,240,0.35) 100%)',
        }}
      />
      <div
        className="absolute inset-0 opacity-0 dark:opacity-100"
        style={{
          background:
            'radial-gradient(ellipse 80% 70% at 50% 45%, rgba(30,41,59,0.0) 0%, rgba(2,6,23,0.35) 100%)',
        }}
      />
      {/* 별은 캔버스 패럴랙스 필드(renderStarfield)가 담당 — 팬/줌에 원근으로 반응 */}
      {/* 은하수 무드의 오로라 — 폴더 컬러 톤과 어울리는 한 줄기 */}
      {!reducedGraphEffects && (
        <>
          <div
            className="absolute -left-1/4 top-[12%] h-[42%] w-[70%] rounded-full blur-3xl opacity-[0.05] dark:opacity-[0.08] animate-pulse"
            style={{
              background: 'linear-gradient(100deg, #6E93C4, transparent 70%)',
              animationDuration: '7s',
              animationPlayState: isGraphHovered ? 'running' : 'paused',
            }}
          />
          <div
            className="absolute -right-1/4 bottom-[10%] h-[38%] w-[64%] rounded-full blur-3xl opacity-[0.04] dark:opacity-[0.07] animate-pulse"
            style={{
              background: 'linear-gradient(260deg, #a78bfa, transparent 70%)',
              animationDuration: '9s',
              animationDelay: '2.5s',
              animationPlayState: isGraphHovered ? 'running' : 'paused',
            }}
          />
        </>
      )}
      {/* 가장자리 비네트: 시선을 그래프 중심으로 */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 120% 110% at 50% 50%, transparent 60%, rgb(100 116 139 / 0.06) 100%)',
        }}
      />
    </div>
  );
}
