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
    runnerMessage,
    currentStatus,
    latestScreenshot,
    hasSession,
    runAction,
  } = useAdminQaSession();

  return (
    <div data-cy="admin-qa-page" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-sans font-black tracking-tighter text-surface-900">
          QA / E2E
        </h1>
        <p className="mt-3 max-w-2xl text-sm sm:text-base text-surface-500 leading-relaxed">
          운영 어드민에서 직접 QA 세션을 시작하고, 진행 로그와 최신 스크린샷을 함께 확인할 수
          있는 실험용 페이지를 제공합니다. 지금은 어드민 UI 테스트 실행 흐름을 한 번에 확인하고,
          실행 결과를 결과 패널에서 이어서 볼 수 있도록 구성되어 있습니다.
        </p>
      </div>

      <AdminTestingRunPanel
        session={session}
        isLoading={isLoading}
        isRunningAction={isRunningAction}
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
