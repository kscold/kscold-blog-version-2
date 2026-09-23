'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef, useState } from 'react';
import { usePerformanceMode } from '@/shared/model/usePerformanceMode';
import { HeroLogoMark } from './HeroLogoMark';

// three.js 는 첫 화면 그리기에 필요 없어서 브라우저에서만, 그것도 한가할 때 불러온다.
const HeroLogoScene = dynamic(() => import('./HeroLogoScene'), { ssr: false });

type IdleWindow = Window & {
  requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
  cancelIdleCallback?: (handle: number) => void;
};

/**
 * 히어로 가운데 로고.
 *
 * 처음에는 평면 SVG 를 바로 그려 첫 화면이 비지 않게 하고, 브라우저가 한가해지면 입체 로고를
 * 불러와 같은 자리에 겹친 뒤 자연스럽게 바꿔 끼운다. 움직임을 줄였거나 그래픽 성능이 낮은
 * 환경에서는 평면 로고만 남긴다.
 */
export function HeroLogo() {
  const { allowRichEffects, supportsHover } = usePerformanceMode();
  const anchorRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!allowRichEffects) return;
    const idleWindow = window as IdleWindow;
    if (idleWindow.requestIdleCallback) {
      const handle = idleWindow.requestIdleCallback(() => setEnabled(true), { timeout: 1800 });
      return () => idleWindow.cancelIdleCallback?.(handle);
    }
    const timer = window.setTimeout(() => setEnabled(true), 700);
    return () => window.clearTimeout(timer);
  }, [allowRichEffects]);

  const handleReady = useCallback(() => setReady(true), []);
  // 입체 로고가 실패해도 평면 로고가 그대로 남아 있으니 조용히 접는다.
  const handleError = useCallback(() => {
    setEnabled(false);
    setReady(false);
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <div
        ref={anchorRef}
        className="absolute left-1/2 top-1/2 aspect-square h-[88%] max-w-[94%] -translate-x-1/2 -translate-y-1/2"
      >
        {/* 떠 있는 물체가 바닥에 닿지 않게 옅은 그림자를 깔아준다. */}
        <div className="hero-logo-shadow absolute inset-x-[18%] -bottom-[6%] h-[9%] rounded-[50%] bg-surface-900/10 blur-2xl" />
        <HeroLogoMark
          className={`hero-logo-float h-full w-full transition-opacity duration-700 ${
            ready && allowRichEffects ? 'opacity-0' : 'opacity-100'
          }`}
        />
      </div>

      {enabled && allowRichEffects && (
        <HeroLogoScene
          anchorRef={anchorRef}
          interactive={supportsHover}
          onReady={handleReady}
          onError={handleError}
          className={`absolute inset-0 h-full w-full transition-opacity duration-700 ${
            ready ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}
    </div>
  );
}
