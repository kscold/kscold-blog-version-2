'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import Button from '@/shared/ui/Button';
import { useAlert } from '@/shared/model/alertStore';

const scenarioLinks = [
  {
    title: '메인 홈',
    description: '히어로 문구와 주요 CTA, 공개 내비게이션을 확인합니다.',
    href: '/',
    dataCy: 'admin-qa-scenario-home',
  },
  {
    title: '방명록',
    description: '로그인 상태별 안내, 작성, 삭제 흐름을 점검합니다.',
    href: '/guestbook',
    dataCy: 'admin-qa-scenario-guestbook',
  },
  {
    title: '블로그 목록',
    description: '카테고리, 검색, 카드 레이아웃 반응형을 확인합니다.',
    href: '/blog',
    dataCy: 'admin-qa-scenario-blog',
  },
  {
    title: '피드',
    description: '댓글 작성 정책과 리스트 배치를 확인합니다.',
    href: '/feed',
    dataCy: 'admin-qa-scenario-feed',
  },
  {
    title: 'Vault',
    description: '노트 탐색과 댓글 흐름, 모바일 레이아웃을 확인합니다.',
    href: '/vault',
    dataCy: 'admin-qa-scenario-vault',
  },
  {
    title: '채팅 관리',
    description: '관리자 채팅방 목록과 대화 화면을 점검합니다.',
    href: '/admin/chat',
    dataCy: 'admin-qa-scenario-admin-chat',
  },
  {
    title: '포스트 관리',
    description: '모바일 카드 레이아웃과 관리 액션을 확인합니다.',
    href: '/admin/posts',
    dataCy: 'admin-qa-scenario-admin-posts',
  },
];

const commands = [
  {
    title: 'QA 러너 실행',
    command: 'pnpm qa:runner',
    dataCy: 'admin-qa-command-runner',
  },
  {
    title: '전체 E2E 실행',
    command: 'pnpm --dir apps/web test:e2e',
    dataCy: 'admin-qa-command-run',
  },
  {
    title: 'Cypress 러너 열기',
    command: 'pnpm --dir apps/web cy:open',
    dataCy: 'admin-qa-command-open',
  },
];

interface QaScreenshot {
  name: string;
  url: string;
}

interface QaSession {
  id: string;
  suiteId: string;
  suiteLabel: string;
  status: 'running' | 'completed' | 'failed';
  startedAt: string | null;
  endedAt: string | null;
  exitCode: number | null;
  logs: string[];
  screenshots: QaScreenshot[];
  latestScreenshotUrl: string | null;
}

interface QaSessionResponse {
  session: QaSession | null;
  message?: string;
}

function formatTime(value: string | null) {
  if (!value) return '-';

  return new Intl.DateTimeFormat('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(value));
}

function statusLabel(status: QaSession['status'] | 'idle') {
  if (status === 'running') return '실행 중';
  if (status === 'completed') return '통과';
  if (status === 'failed') return '실패';
  return '대기 중';
}

function statusTone(status: QaSession['status'] | 'idle') {
  if (status === 'running') return 'border-blue-200 bg-blue-50 text-blue-700';
  if (status === 'completed') return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  if (status === 'failed') return 'border-red-200 bg-red-50 text-red-700';
  return 'border-surface-200 bg-surface-50 text-surface-500';
}

export function AdminTestingSection() {
  const alerts = useAlert();
  const [session, setSession] = useState<QaSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRunningAction, setIsRunningAction] = useState(false);
  const [runnerMessage, setRunnerMessage] = useState<string | null>(null);
  const latestStatusRef = useRef<QaSession['status'] | 'idle'>('idle');

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

      const data = await response.json().catch(() => ({ session: null, message: '응답을 읽지 못했습니다.' }));
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

  const hasSession = Boolean(session);
  const currentStatus = session?.status || 'idle';
  const latestScreenshot = session?.latestScreenshotUrl || null;

  return (
    <div data-cy="admin-qa-page" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-sans font-black tracking-tighter text-surface-900">
          QA / E2E
        </h1>
        <p className="mt-3 max-w-2xl text-sm sm:text-base text-surface-500 leading-relaxed">
          운영 어드민에서 직접 QA 세션을 시작하고, 진행 로그와 최신 스크린샷을 함께 확인하는
          실험용 페이지입니다. 지금은 어드민 UI 스모크 시나리오를 한 번에 돌리고, 실행 흔적을
          결과 패널에 모아 보는 흐름으로 정리했습니다.
        </p>
      </div>

      <section className="mb-10 grid grid-cols-1 xl:grid-cols-[1.2fr_1fr] gap-4">
        <div className="rounded-2xl border border-surface-200 bg-white p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-surface-900">실행 패널</h2>
                <span
                  className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusTone(currentStatus)}`}
                >
                  {statusLabel(currentStatus)}
                </span>
              </div>
              <p className="mt-2 text-sm text-surface-500 leading-relaxed">
                어드민 스모크 시나리오를 시작하면 최신 스크린샷과 로그가 자동으로 갱신됩니다.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                type="button"
                size="sm"
                isLoading={isRunningAction && currentStatus !== 'running'}
                disabled={isLoading || isRunningAction || currentStatus === 'running'}
                onClick={() => void runAction('start')}
                data-cy="admin-qa-run-button"
              >
                스모크 실행
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                isLoading={isRunningAction && currentStatus === 'running'}
                disabled={isLoading || isRunningAction || currentStatus !== 'running'}
                onClick={() => void runAction('stop')}
                data-cy="admin-qa-stop-button"
              >
                실행 중지
              </Button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-xl border border-surface-100 bg-surface-50 px-4 py-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-surface-400">
                최근 실행
              </div>
              <div className="mt-2 text-sm font-semibold text-surface-900">
                {session?.suiteLabel || '어드민 UI 스모크'}
              </div>
              <div className="mt-1 text-xs text-surface-500">{session?.id || '아직 없음'}</div>
            </div>
            <div className="rounded-xl border border-surface-100 bg-surface-50 px-4 py-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-surface-400">
                시작 시각
              </div>
              <div className="mt-2 text-sm font-semibold text-surface-900">
                {formatTime(session?.startedAt || null)}
              </div>
            </div>
            <div className="rounded-xl border border-surface-100 bg-surface-50 px-4 py-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-surface-400">
                종료 / 코드
              </div>
              <div className="mt-2 text-sm font-semibold text-surface-900">
                {formatTime(session?.endedAt || null)}
              </div>
              <div className="mt-1 text-xs text-surface-500">
                exit code {session?.exitCode ?? '-'}
              </div>
            </div>
          </div>

          {runnerMessage ? (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              {runnerMessage}
            </div>
          ) : null}
        </div>

        <div className="rounded-2xl border border-surface-200 bg-white p-5">
          <h2 className="text-lg font-bold text-surface-900">실행 개요</h2>
          <ul className="mt-3 space-y-2 text-sm text-surface-500 leading-relaxed">
            <li>실행은 호스트 QA 러너가 맡고, 어드민에서는 세션 상태만 제어합니다.</li>
            <li>현재 시나리오는 라이브 `kscold.com` 어드민 UI 스모크 흐름입니다.</li>
            <li>실패가 나면 로그와 마지막 스크린샷부터 먼저 보면 원인 파악이 빠릅니다.</li>
          </ul>
        </div>
      </section>

      <section className="mb-10 grid grid-cols-1 xl:grid-cols-[1.2fr_1fr] gap-4">
        <div className="rounded-2xl border border-surface-200 bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-surface-900">실행 로그</h2>
            <span className="text-xs font-medium text-surface-400">
              {session?.logs.length || 0} lines
            </span>
          </div>
          <div className="mt-4 rounded-2xl bg-surface-950 text-surface-100 p-4 min-h-[280px] max-h-[420px] overflow-auto">
            <pre
              data-cy="admin-qa-log-panel"
              className="text-[11px] sm:text-xs leading-6 whitespace-pre-wrap break-words font-mono"
            >
              {session?.logs.length
                ? session.logs.join('\n')
                : 'QA 세션을 시작하면 로그가 이곳에 쌓입니다.'}
            </pre>
          </div>
        </div>

        <div className="rounded-2xl border border-surface-200 bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-surface-900">최신 스크린샷</h2>
            <span className="text-xs font-medium text-surface-400">
              {session?.screenshots.length || 0} captured
            </span>
          </div>
          <div className="mt-4 rounded-2xl border border-surface-100 bg-surface-50 overflow-hidden">
            {latestScreenshot ? (
              <div className="relative aspect-[16/10]">
                <Image
                  src={latestScreenshot}
                  alt="QA 최신 스크린샷"
                  fill
                  unoptimized
                  className="object-cover object-top"
                  sizes="(max-width: 1280px) 100vw, 540px"
                />
              </div>
            ) : (
              <div className="flex min-h-[260px] items-center justify-center px-6 text-center text-sm text-surface-400">
                스모크 시나리오가 진행되면 단계별 스크린샷이 이곳에 올라옵니다.
              </div>
            )}
          </div>
          {latestScreenshot ? (
            <a
              href={latestScreenshot}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex text-sm font-semibold text-surface-700 hover:text-surface-900"
            >
              원본 이미지 열기
            </a>
          ) : null}
        </div>
      </section>

      <section className="mb-10">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="text-lg font-bold text-surface-900">스크린샷 타임라인</h2>
          <span className="text-xs font-medium text-surface-400">
            {hasSession ? '세션 아티팩트' : '세션 시작 전'}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {session?.screenshots.length ? (
            session.screenshots.map(item => (
              <a
                key={item.url}
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="group overflow-hidden rounded-2xl border border-surface-200 bg-white hover:border-surface-300 hover:shadow-sm transition-all"
              >
                <div className="relative aspect-[16/10] bg-surface-100">
                  <Image
                    src={item.url}
                    alt={item.name}
                    fill
                    unoptimized
                    className="object-cover object-top"
                    sizes="(max-width: 1280px) 100vw, 420px"
                  />
                </div>
                <div className="px-4 py-3">
                  <div className="text-sm font-semibold text-surface-900 break-all">{item.name}</div>
                  <div className="mt-1 text-xs text-surface-400">새 탭에서 원본 보기</div>
                </div>
              </a>
            ))
          ) : (
            <div className="col-span-full rounded-2xl border border-dashed border-surface-200 bg-surface-50 px-6 py-10 text-center text-sm text-surface-400">
              아직 저장된 스크린샷이 없습니다.
            </div>
          )}
        </div>
      </section>

      <section className="mb-10">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="text-lg font-bold text-surface-900">시나리오 바로가기</h2>
          <span className="text-xs font-medium text-surface-400">Public + Admin 흐름</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {scenarioLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              data-cy={link.dataCy}
              className="group rounded-2xl border border-surface-200 bg-white p-5 hover:border-surface-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-surface-900">{link.title}</h3>
                  <p className="mt-2 text-sm text-surface-500 leading-relaxed">{link.description}</p>
                </div>
                <span className="shrink-0 text-surface-300 group-hover:text-surface-500 transition-colors">
                  →
                </span>
              </div>
              <div className="mt-4 text-xs font-mono text-surface-400">{link.href}</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4">
        <div className="rounded-2xl border border-surface-200 bg-white p-5">
          <h2 className="text-lg font-bold text-surface-900 mb-3">로컬 실행 명령</h2>
          <div className="space-y-3">
            {commands.map(item => (
              <div
                key={item.command}
                data-cy={item.dataCy}
                className="rounded-xl border border-surface-100 bg-surface-50 px-4 py-3"
              >
                <div className="text-sm font-semibold text-surface-900">{item.title}</div>
                <code className="mt-2 block text-xs sm:text-sm text-surface-600 break-all">
                  {item.command}
                </code>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-surface-200 bg-white p-5">
          <h2 className="text-lg font-bold text-surface-900 mb-3">운영에서 보는 목적</h2>
          <ul className="space-y-2 text-sm text-surface-500 leading-relaxed">
            <li>어떤 경로를 점검하는지 빠르게 공유하고 바로 실행까지 연결할 수 있습니다.</li>
            <li>모바일 레이아웃, 댓글/방명록 흐름, 어드민 관리 화면을 한 번에 훑을 수 있습니다.</li>
            <li>실패한 경우에도 마지막 화면과 로그를 남겨, 회사 밖에서도 흐름을 다시 볼 수 있습니다.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
