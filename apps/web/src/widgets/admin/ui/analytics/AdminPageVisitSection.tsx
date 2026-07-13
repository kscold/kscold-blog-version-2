'use client';

import { useState } from 'react';
import { useDailyVisits, useTopPaths, useVisitHistory } from '@/entities/analytics';
import { VisitWindowSelector, type VisitWindow } from './VisitWindowSelector';
import { DailyVisitsChart } from './DailyVisitsChart';
import { TopPathsList } from './TopPathsList';
import { VisitHistoryList } from './VisitHistoryList';

export function AdminPageVisitSection() {
  const [window, setWindow] = useState<VisitWindow>(7);
  const [loggedInOnly, setLoggedInOnly] = useState(true);
  const { data: daily = [], isLoading: dailyLoading } = useDailyVisits(window);
  const { data: topPaths = [], isLoading: pathsLoading } = useTopPaths(window, 15);
  const { data: history = [], isLoading: historyLoading } = useVisitHistory({ loggedInOnly, limit: 80 });

  const totalVisits = daily.reduce((sum, d) => sum + d.visits, 0);

  return (
    <div className="space-y-4">
      {/* 기간 선택 */}
      <VisitWindowSelector window={window} onSelect={setWindow} totalVisits={totalVisits} />

      {/* 일별 방문 추이 */}
      <DailyVisitsChart daily={daily} isLoading={dailyLoading} />

      {/* 인기 페이지 */}
      <TopPathsList topPaths={topPaths} isLoading={pathsLoading} />

      {/* 방문자 히스토리 */}
      <VisitHistoryList
        history={history}
        isLoading={historyLoading}
        loggedInOnly={loggedInOnly}
        onToggle={setLoggedInOnly}
      />
    </div>
  );
}
