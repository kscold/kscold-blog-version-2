'use client';

import { AdminTestingArtifactsPanel } from '@/widgets/admin/ui/AdminTestingArtifactsPanel';
import { AdminTestingReferencePanels } from '@/widgets/admin/ui/AdminTestingReferencePanels';
import { AdminTestingRunPanel } from '@/widgets/admin/ui/AdminTestingRunPanel';
import { useAdminQaSession } from '@/widgets/admin/lib/useAdminQaSession';

export function AdminTestingSection() {
  const {
    session,
    isLoading,
    isRunningAction,
    activeAction,
    runnerMessage,
    currentStatus,
    latestScreenshot,
    hasSession,
    runAction,
  } = useAdminQaSession();

  return (
    <div data-cy="admin-qa-page" className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-10 space-y-3">
        <h1 className="text-3xl font-sans font-black tracking-tighter text-surface-900 sm:text-4xl">
          QA / E2E
        </h1>
        <p className="max-w-3xl text-sm leading-6 text-surface-500 sm:text-base">
          운영 어드민에서 직접 테스트 세션을 시작하고, 진행 로그와 최신 스크린샷을 함께 확인할 수 있는 페이지를 제공합니다.
          현재는 어드민 UI 테스트 실행 흐름을 한 번에 살펴보고, 실행 결과를 아래 패널에서 이어서 확인할 수 있습니다.
        </p>
      </div>

      <AdminTestingRunPanel
        session={session}
        isLoading={isLoading}
        isRunningAction={isRunningAction}
        activeAction={activeAction}
        runnerMessage={runnerMessage}
        currentStatus={currentStatus}
        onAction={runAction}
      />

      <AdminTestingArtifactsPanel
        session={session}
        latestScreenshot={latestScreenshot}
        hasSession={hasSession}
      />

      <AdminTestingReferencePanels />
    </div>
  );
}
