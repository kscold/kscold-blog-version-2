'use client';

import { ChoiceGroup, DemoFrame } from '../DemoFrame';
import { ElectionVerdict } from './ElectionVerdict';
import { ReplicaNodeCard } from './ReplicaNodeCard';
import { countOnline, getMajority, getNodeRole, NODE_COUNT_OPTIONS, type NodeCount } from './replicaSetModel';
import { useReplicaSetElection } from './useReplicaSetElection';

// 노드 수에 따라 카드가 좁은 화면에서도 잘리지 않게 칸 수를 고른다.
const GRID_COLUMNS: Record<NodeCount, string> = {
  2: 'grid-cols-2',
  3: 'grid-cols-2 sm:grid-cols-3',
  5: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5',
};

const COUNT_OPTIONS = NODE_COUNT_OPTIONS.map(count => ({ value: count, label: `${count}대` }));

export function ReplicaSetElectionDemo() {
  const election = useReplicaSetElection(3);
  const majority = getMajority(election.nodes.length);

  return (
    <DemoFrame
      title="노드를 꺼 보면서 쓰기가 되는지 확인해 보세요"
      description="노드를 하나씩 끄고 켜 보세요. 과반이 남아 있으면 새 Primary를 뽑고, 과반이 깨지면 남은 노드가 있어도 쓰기가 멈춰요."
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ChoiceGroup
          label="레플리카셋 노드 수"
          options={COUNT_OPTIONS}
          value={election.nodeCount}
          onChange={election.changeNodeCount}
        />
        <button
          type="button"
          onClick={election.reset}
          className="text-sm font-medium text-surface-500 underline-offset-4 hover:text-surface-900 hover:underline dark:text-surface-400 dark:hover:text-white"
        >
          처음으로
        </button>
      </div>

      <div className={`grid gap-3 ${GRID_COLUMNS[election.nodeCount]}`}>
        {election.nodes.map(node => (
          <ReplicaNodeCard
            key={node.id}
            node={node}
            role={getNodeRole(node, election.primaryId, election.isElecting)}
            onToggle={election.toggle}
          />
        ))}
      </div>

      <ElectionVerdict
        onlineCount={countOnline(election.nodes)}
        nodeCount={election.nodes.length}
        majority={majority}
        primaryId={election.primaryId}
        isElecting={election.isElecting}
      />

      <p className="text-xs leading-relaxed text-surface-500 dark:text-surface-400">
        모든 노드가 데이터와 투표권을 가진 경우예요. 남은 노드는 꺼진 노드가 정말 죽었는지, 네트워크만 끊겼는지
        구분할 수 없어요. 그래서 과반이 서로 보일 때만 Primary를 정하고, 데이터가 두 갈래로 나뉘는 일을 막아요.
      </p>
    </DemoFrame>
  );
}
