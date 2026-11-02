'use client';

import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';
import type { InteractiveDemoId } from './interactiveDemoIds';

function DemoSkeleton() {
  return <div className="h-80 animate-pulse rounded-2xl bg-surface-100 dark:bg-surface-800" />;
}

// 데모 코드는 그 데모를 쓰는 글에서만 내려받도록 데모마다 청크를 나눈다.
const DEMOS: Record<InteractiveDemoId, ComponentType> = {
  'replica-set-election': dynamic(
    () => import('./replica-set/ReplicaSetElectionDemo').then(module => module.ReplicaSetElectionDemo),
    { loading: DemoSkeleton },
  ),
  'shard-key-routing': dynamic(
    () => import('./shard-key/ShardKeyRoutingDemo').then(module => module.ShardKeyRoutingDemo),
    { loading: DemoSkeleton },
  ),
};

export function InteractiveBlock({ demoId }: { demoId: InteractiveDemoId }) {
  const Demo = DEMOS[demoId];

  return (
    // 다른 렌더러가 pre 안에 넣더라도 본문 글꼴과 줄바꿈을 쓰도록 여기서 되돌린다.
    <div data-interactive-demo={demoId} className="not-prose my-8 whitespace-normal font-sans">
      <Demo />
    </div>
  );
}
