'use client';

import { useEffect, useState } from 'react';
import {
  getAdminNightDateKey,
  millisecondsUntilNextAdminNightDay,
} from '@/widgets/admin-night/lib/adminNight';

const MIDNIGHT_SYNC_DELAY_MS = 1_000;

/** 서버가 준 날짜로 수화한 뒤 서울 자정과 탭 복귀 시점에 오늘을 다시 맞춘다. */
export function useAdminNightDateKey(initialDateKey = '') {
  const [dateKey, setDateKey] = useState(initialDateKey);

  useEffect(() => {
    let midnightTimer: ReturnType<typeof setTimeout> | undefined;

    const synchronizeDate = () => {
      const now = new Date();
      setDateKey(getAdminNightDateKey(now));
      if (midnightTimer) clearTimeout(midnightTimer);
      midnightTimer = setTimeout(
        synchronizeDate,
        millisecondsUntilNextAdminNightDay(now) + MIDNIGHT_SYNC_DELAY_MS
      );
    };
    const synchronizeVisibleDate = () => {
      if (document.visibilityState === 'visible') synchronizeDate();
    };

    synchronizeDate();
    window.addEventListener('focus', synchronizeDate);
    document.addEventListener('visibilitychange', synchronizeVisibleDate);
    return () => {
      if (midnightTimer) clearTimeout(midnightTimer);
      window.removeEventListener('focus', synchronizeDate);
      document.removeEventListener('visibilitychange', synchronizeVisibleDate);
    };
  }, []);

  return dateKey;
}
