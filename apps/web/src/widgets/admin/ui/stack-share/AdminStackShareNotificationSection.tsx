'use client';

import { useState } from 'react';
import { AdminPage, AdminPageHeader } from '@/shared/ui/AdminPage';
import { AdminTabs } from '@/shared/ui/AdminTabs';
import { AlimtalkTemplateManager } from './AlimtalkTemplateManager';
import { StackShareAccountPanel } from './StackShareAccountPanel';
import { StackShareGroupPanel } from './StackShareGroupPanel';
import { StackShareParticipantPanel } from './StackShareParticipantPanel';
import { StackShareSettlementComposer } from './StackShareSettlementComposer';
import { StackShareSettlementHistory } from './StackShareSettlementHistory';

type StackShareTab = 'settlement' | 'people' | 'settings';

const TABS = [
  { key: 'settlement', label: '정산' },
  { key: 'people', label: '참여자·그룹' },
  { key: 'settings', label: '계좌·알림톡' },
] as const;

export function AdminStackShareNotificationSection() {
  const [tab, setTab] = useState<StackShareTab>('settlement');

  return (
    <AdminPage>
      <AdminPageHeader
        eyebrow="Stack Share"
        title="공동 구독 정산"
        description="함께 결제하는 툴의 분담금을 계산해 알림톡으로 정산을 요청하고, 입금이 끝난 건은 정산 완료로 정리합니다."
      />

      {/* 매달 하는 일(정산 보내기·기록 확인)을 먼저 두고, 가끔 손보는 설정은 탭 뒤로 보낸다. */}
      <AdminTabs label="정산 관리 구역" tabs={TABS} active={tab} onChange={setTab} />

      {tab === 'settlement' && (
        <>
          <StackShareSettlementComposer />
          <StackShareSettlementHistory />
        </>
      )}
      {tab === 'people' && (
        <>
          <StackShareGroupPanel />
          <StackShareParticipantPanel />
        </>
      )}
      {tab === 'settings' && (
        <>
          <StackShareAccountPanel />
          <AlimtalkTemplateManager />
        </>
      )}
    </AdminPage>
  );
}
