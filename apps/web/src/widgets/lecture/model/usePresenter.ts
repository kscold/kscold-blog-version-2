'use client';

import { useCallback, useEffect, useState } from 'react';
import { useStoredString } from '@/shared/lib/useBrowserSnapshot';

const FONT_SIZES = [18, 20, 22, 25, 28, 32] as const;
const FONT_KEY = 'hansalim-presenter-font';
const TIMER_KEY = 'hansalim-presenter-start';

function writeStorage(key: string, value: string | null) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    // 개인 정보 보호 모드처럼 저장소를 못 쓰면 이번 화면에서만 기억한다.
  }
}

/** 대본 글자 크기. 기기마다 다르게 쓰므로 이 브라우저에만 기억한다. */
export function useScriptFontSize() {
  const stored = useStoredString(FONT_KEY);
  const saved = Number.parseInt(stored ?? '', 10);
  const [selectedIndex, setIndex] = useState<number | null>(null);
  const index = selectedIndex ?? (saved >= 0 && saved < FONT_SIZES.length ? saved : 2);

  const change = useCallback((delta: number) => {
    const next = Math.min(Math.max(index + delta, 0), FONT_SIZES.length - 1);
    writeStorage(FONT_KEY, String(next));
    setIndex(next);
  }, [index]);

  return {
    size: FONT_SIZES[index],
    smaller: () => change(-1),
    larger: () => change(1),
    canShrink: index > 0,
    canGrow: index < FONT_SIZES.length - 1,
  };
}

/** 1초마다 바뀌는 지금 시각. 시계·경과 시간·예정 시각 비교에 함께 쓴다. */
export function useNow() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  return now;
}

/** 강의 경과 시간. 새로고침해도 이어지도록 시작 시각을 이 브라우저에 기억한다. */
export function useElapsedTimer() {
  const stored = useStoredString(TIMER_KEY);
  const saved = Number.parseInt(stored ?? '', 10);
  const [selectedStart, setStartedAt] = useState<number | null | undefined>(undefined);
  const startedAt = selectedStart === undefined ? (Number.isFinite(saved) && saved > 0 ? saved : null) : selectedStart;

  const start = useCallback(() => {
    const value = Date.now();
    writeStorage(TIMER_KEY, String(value));
    setStartedAt(value);
  }, [setStartedAt]);

  const reset = useCallback(() => {
    writeStorage(TIMER_KEY, null);
    setStartedAt(null);
  }, [setStartedAt]);

  return { startedAt, start, reset };
}

/** 발표 중 아이패드 화면이 꺼지지 않게 한다. 지원하지 않는 브라우저에서는 아무 일도 하지 않는다. */
export function useScreenWakeLock() {
  useEffect(() => {
    type WakeLock = { release: () => Promise<void> };
    const wakeLock = (
      navigator as Navigator & { wakeLock?: { request: (type: 'screen') => Promise<WakeLock> } }
    ).wakeLock;
    if (!wakeLock) return;
    let lock: WakeLock | null = null;
    const request = () => {
      if (document.visibilityState !== 'visible') return;
      wakeLock
        .request('screen')
        .then(value => {
          lock = value;
        })
        .catch(() => undefined);
    };
    // 다른 앱에 다녀오면 잠금이 풀리므로 화면이 다시 보일 때 새로 건다.
    request();
    document.addEventListener('visibilitychange', request);
    return () => {
      document.removeEventListener('visibilitychange', request);
      void lock?.release().catch(() => undefined);
    };
  }, []);
}

/** 「10:12–10:14」를 오늘 날짜의 시작·끝 시각으로 바꾼다. 「참고」처럼 시각이 아니면 null. */
export function parseSlot(time: string, now: number) {
  const match = time.match(/^(\d{1,2}):(\d{2})\s*[–-]\s*(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const at = (hour: string, minute: string) => {
    const date = new Date(now);
    date.setHours(Number(hour), Number(minute), 0, 0);
    return date.getTime();
  };
  return { start: at(match[1], match[2]), end: at(match[3], match[4]) };
}

/** 예정 시각보다 몇 분 늦거나 빠른지. 강의 시간대와 멀리 떨어져 있으면(리허설 등) 보이지 않는다. */
export function scheduleGap(time: string, now: number) {
  const slot = parseSlot(time, now);
  if (!slot) return null;
  const minutes = (value: number) => Math.round(value / 60_000);
  let gap = 0;
  if (now > slot.end) gap = minutes(now - slot.end);
  else if (now < slot.start) gap = -minutes(slot.start - now);
  return Math.abs(gap) > 90 ? null : gap;
}

export function formatClock(value: number) {
  return new Date(value).toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export function formatElapsed(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  const two = (value: number) => String(value).padStart(2, '0');
  return hours ? `${hours}:${two(minutes)}:${two(seconds)}` : `${two(minutes)}:${two(seconds)}`;
}
