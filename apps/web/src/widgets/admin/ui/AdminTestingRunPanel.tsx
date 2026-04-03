import type { QaSession } from '@/widgets/admin/lib/adminTesting';
import { formatSessionId, formatTime, statusLabel, statusTone } from '@/widgets/admin/lib/adminTesting';
import Button from '@/shared/ui/Button';

interface AdminTestingRunPanelProps {
  session: QaSession | null;
  isLoading: boolean;
  isRunningAction: boolean;
  runnerMessage: string | null;
  currentStatus: QaSession['status'] | 'idle';
  onAction: (action: 'start' | 'stop') => Promise<void>;
}

export function AdminTestingRunPanel({
  session,
  isLoading,
  isRunningAction,
  runnerMessage,
  currentStatus,
  onAction,
}: AdminTestingRunPanelProps) {
  return (
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
              어드민 UI 테스트 실행을 시작하면 최신 스크린샷과 로그가 자동으로 갱신됩니다.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              size="sm"
              isLoading={isRunningAction && currentStatus !== 'running'}
              disabled={isLoading || isRunningAction || currentStatus === 'running'}
              onClick={() => void onAction('start')}
              data-cy="admin-qa-run-button"
            >
              테스트 실행
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              isLoading={isRunningAction && currentStatus === 'running'}
              disabled={isLoading || isRunningAction || currentStatus !== 'running'}
              onClick={() => void onAction('stop')}
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
              {session?.suiteLabel || '어드민 UI 테스트 실행'}
            </div>
            <div className="mt-1 text-xs text-surface-500">{formatSessionId(session?.id || null)}</div>
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
            <div className="mt-1 text-xs text-surface-500">exit code {session?.exitCode ?? '-'}</div>
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
          <li>현재는 라이브 `kscold.com` 기준 어드민 UI 테스트 실행 흐름을 제공합니다.</li>
          <li>실패가 나면 로그와 마지막 스크린샷부터 먼저 보면 원인 파악이 빠릅니다.</li>
        </ul>
      </div>
    </section>
  );
}
