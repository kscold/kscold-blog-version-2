'use client';

import { useEffect, useState } from 'react';

const formatter = new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Asia/Seoul',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

/**
 * 서울 현재 시각. 서버와 브라우저의 시각이 달라 생기는 하이드레이션 차이를 피하려고
 * 처음에는 자리만 잡아두고 화면이 뜬 뒤에 채운다.
 */
export function HeroClock() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => setTime(formatter.format(new Date()));
    tick();
    const timer = window.setInterval(tick, 15_000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <span className="tabular-nums">
      Seoul <span className="text-surface-600">{time ?? '--:--'}</span>
    </span>
  );
}
