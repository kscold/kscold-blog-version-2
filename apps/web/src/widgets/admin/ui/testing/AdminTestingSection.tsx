'use client';

import { AdminTestingArtifactsPanel } from '@/widgets/admin/ui/testing/AdminTestingArtifactsPanel';
import { AdminTestingReferencePanels } from '@/widgets/admin/ui/testing/AdminTestingReferencePanels';
import { AdminTestingRunPanel } from '@/widgets/admin/ui/testing/AdminTestingRunPanel';
import { useAdminQaSession } from '@/widgets/admin/lib/useAdminQaSession';
import { AdminPage, AdminPageHeader } from '@/shared/ui/AdminPage';

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
    <AdminPage testId="admin-qa-page">
      <AdminPageHeader
        eyebrow="Quality"
        title="QA / E2E"
        description="테스트 세션을 직접 시작하고, 진행 로그와 최신 스크린샷을 아래 패널에서 이어서 확인합니다."
      />

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
    </AdminPage>
  );
}
