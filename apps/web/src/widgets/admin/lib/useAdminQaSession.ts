'use client';

import { useEffect, useRef, useState } from 'react';
import { apiClient } from '@/shared/api/api-client';
import { useAlert } from '@/shared/model/alertStore';
import type { QaSession, QaSessionResponse } from './adminTesting';

type QaSessionStatus = QaSession['status'] | 'idle';
type QaAction = 'start' | 'stop' | 'delete';

/**
 * QA 경로를 호출한다. 화면을 오래 열어 두면 액세스 토큰이 만료돼 401이 오는데,
 * 공용 클라이언트로 내 정보를 한 번 조회해 토큰 갱신을 태운 뒤 같은 요청을 다시 보낸다.
 */
async function requestQa(input: string, init: RequestInit): Promise<Response> {
  const options: RequestInit = { ...init, cache: 'no-store', credentials: 'same-origin' };
  const response = await fetch(input, options);
  if (response.status !== 401) return response;

  try {
    await apiClient.get('/auth/me');
  } catch {
    return response;
  }
  return fetch(input, options);
}

export function useAdminQaSession() {
  const alerts = useAlert();
  const [session, setSession] = useState<QaSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRunningAction, setIsRunningAction] = useState(false);
  const [activeAction, setActiveAction] = useState<QaAction | null>(null);
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
        const response = await requestQa('/admin/testing/session', { method: 'GET' });
        const data: QaSessionResponse = await response.json();

        if (!active) return;

        setSession(data.session);
        setRunnerMessage(response.ok ? null : data.message || 'QA 러너와 통신하지 못했습니다.');
        latestStatusRef.current = data.session?.status || 'idle';
      } catch {
        if (!active) return;
        setRunnerMessage('실행 상태를 불러오지 못했습니다. 잠시 뒤 다시 확인합니다.');
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

  async function runAction(action: QaAction) {
    if (action === 'delete' && session?.id) {
      const confirmed = window.confirm('현재 실행 결과와 저장된 스크린샷을 삭제할까요?');
      if (!confirmed) return;
    }

    setIsRunningAction(true);
    setActiveAction(action);

    try {
      const endpoint =
        action === 'start'
          ? '/admin/testing/session'
          : action === 'stop'
            ? '/admin/testing/session/stop'
            : '/admin/testing/session/delete';

      const body =
        action === 'start'
          ? { suiteId: 'admin_smoke' }
          : action === 'delete'
            ? { sessionId: session?.id }
            : undefined;

      const response = await requestQa(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      const data: QaSessionResponse = await response
        .json()
        .catch(() => ({ session: null, message: '응답을 읽지 못했습니다.' }));

      setSession(data.session || null);
      setRunnerMessage(response.ok ? null : data.message || 'QA 세션을 처리하지 못했습니다.');
      latestStatusRef.current = data.session?.status || 'idle';

      if (response.ok) {
        if (action === 'start') {
          alerts.success('QA 세션을 시작했습니다.');
        } else if (action === 'stop') {
          alerts.info(data.stopped ? '실행 중인 QA 세션을 중지했습니다.' : '중지할 세션이 없었습니다.');
        } else {
          alerts.success(data.deleted ? '저장된 QA 스크린샷을 삭제했습니다.' : '삭제할 실행 결과가 없었습니다.');
        }
      } else {
        alerts.error(data.message || 'QA 세션 요청에 실패했습니다.');
      }
    } catch {
      setRunnerMessage('요청을 보내지 못했습니다. 네트워크 상태를 확인해 주세요.');
      alerts.error('QA 요청을 보내지 못했습니다.');
    } finally {
      setIsRunningAction(false);
      setActiveAction(null);
    }
  }

  return {
    session,
    isLoading,
    isRunningAction,
    activeAction,
    runnerMessage,
    currentStatus: (session?.status || 'idle') as QaSessionStatus,
    latestScreenshot: session?.latestScreenshotUrl || null,
    hasSession: Boolean(session),
    runAction,
  };
}
