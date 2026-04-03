'use client';

import { useEffect, useRef, useState } from 'react';
import { useAlert } from '@/shared/model/alertStore';
import type { QaSession, QaSessionResponse } from './adminTesting';

type QaSessionStatus = QaSession['status'] | 'idle';

export function useAdminQaSession() {
  const alerts = useAlert();
  const [session, setSession] = useState<QaSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRunningAction, setIsRunningAction] = useState(false);
  const [runnerMessage, setRunnerMessage] = useState<string | null>(null);
  const latestStatusRef = useRef<QaSessionStatus>('idle');

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const loadSession = async (showInitialLoader = false) => {
      if (showInitialLoader) {
        setIsLoading(true);
      }

      try {
        const response = await fetch('/admin/testing/session', {
          method: 'GET',
          cache: 'no-store',
          credentials: 'same-origin',
        });
        const data: QaSessionResponse = await response.json();

        if (!active) return;

        setSession(data.session);
        setRunnerMessage(response.ok ? null : data.message || 'QA 러너와 통신하지 못했습니다.');
        latestStatusRef.current = data.session?.status || 'idle';
      } catch {
        if (!active) return;
        setRunnerMessage('QA 러너가 아직 실행되지 않았습니다.');
        setSession(null);
        latestStatusRef.current = 'idle';
      } finally {
        if (!active) return;
        setIsLoading(false);

        timer = setTimeout(
          () => {
            void loadSession();
          },
          latestStatusRef.current === 'running' ? 2000 : 7000
        );
      }
    };

    void loadSession(true);

    return () => {
      active = false;
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, []);

  async function runAction(action: 'start' | 'stop') {
    setIsRunningAction(true);

    try {
      const response = await fetch(
        action === 'start' ? '/admin/testing/session' : '/admin/testing/session/stop',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: action === 'start' ? JSON.stringify({ suiteId: 'admin_smoke' }) : undefined,
          cache: 'no-store',
          credentials: 'same-origin',
        }
      );

      const data: QaSessionResponse = await response
        .json()
        .catch(() => ({ session: null, message: '응답을 읽지 못했습니다.' }));

      setSession(data.session || null);
      setRunnerMessage(response.ok ? null : data.message || 'QA 세션을 처리하지 못했습니다.');
      latestStatusRef.current = data.session?.status || 'idle';

      if (response.ok) {
        if (action === 'start') {
          alerts.success('QA 세션을 시작했습니다.');
        } else {
          alerts.info(data.stopped ? '실행 중인 QA 세션을 중지했습니다.' : '중지할 세션이 없었습니다.');
        }
      } else {
        alerts.error(data.message || 'QA 세션 요청에 실패했습니다.');
      }
    } catch {
      setRunnerMessage('QA 러너가 아직 실행되지 않았습니다.');
      alerts.error('QA 러너에 연결하지 못했습니다.');
    } finally {
      setIsRunningAction(false);
    }
  }

  return {
    session,
    isLoading,
    isRunningAction,
    runnerMessage,
    currentStatus: (session?.status || 'idle') as QaSessionStatus,
    latestScreenshot: session?.latestScreenshotUrl || null,
    hasSession: Boolean(session),
    runAction,
  };
}
