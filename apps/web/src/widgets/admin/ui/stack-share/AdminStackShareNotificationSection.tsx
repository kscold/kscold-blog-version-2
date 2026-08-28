import { AlimtalkTemplateManager } from './AlimtalkTemplateManager';
import { StackShareAccountPanel } from './StackShareAccountPanel';
import { StackShareParticipantPanel } from './StackShareParticipantPanel';
import { StackShareSettlementComposer } from './StackShareSettlementComposer';
import { StackShareSettlementHistory } from './StackShareSettlementHistory';

export function AdminStackShareNotificationSection() {
  return (
    <main className="min-h-screen bg-surface-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="space-y-3 py-4">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-surface-400">
            Stack Share
          </p>
          <h1 className="text-3xl font-black tracking-tight text-surface-900 sm:text-4xl">
            공동 구독 정산 알림
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-surface-500">
            함께 결제하는 툴의 분담금을 자동 계산하고, 참여자와 발송 기록을 관리자 전용으로 관리합니다.
          </p>
        </header>
        <StackShareAccountPanel />
        <StackShareParticipantPanel />
        <StackShareSettlementComposer />
        <StackShareSettlementHistory />
        <AlimtalkTemplateManager />
      </div>
    </main>
  );
}
