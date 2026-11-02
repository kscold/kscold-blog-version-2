'use client';

import { useState } from 'react';
import { ChoiceGroup, DemoFrame } from '../DemoFrame';
import { ShardDistribution } from './ShardDistribution';
import {
  DEMO_QUERIES,
  getDistribution,
  getRouteStage,
  getTargetShards,
  getTotalMessages,
  SHARD_KEYS,
  type ShardKeyId,
} from './shardKeyModel';

const KEY_OPTIONS = SHARD_KEYS.map(key => ({ value: key.id, label: key.label, isCode: true }));
const QUERY_OPTIONS = DEMO_QUERIES.map(query => ({ value: query.id, label: query.code, isCode: true }));

export function ShardKeyRoutingDemo() {
  const [keyId, setKeyId] = useState<ShardKeyId>('workspace');
  const [queryId, setQueryId] = useState(DEMO_QUERIES[0].id);

  const key = SHARD_KEYS.find(option => option.id === keyId) ?? SHARD_KEYS[0];
  const query = DEMO_QUERIES.find(option => option.id === queryId) ?? DEMO_QUERIES[0];
  const targetShards = getTargetShards(keyId, query.filter);
  const stage = getRouteStage(targetShards);
  const isSingleShard = stage === 'SINGLE_SHARD';

  return (
    <DemoFrame
      title="샤드 키를 바꿔 보면서 데이터와 조회가 어디로 가는지 보세요"
      description={`메시지 ${getTotalMessages().toLocaleString('ko-KR')}개, 워크스페이스 10개 중 ws-07 하나가 80%를 가진 상황이에요. 샤드 키에 따라 데이터가 어떻게 나뉘고, mongos가 조회를 어느 샤드로 보내는지 바뀌어요.`}
    >
      <div className="space-y-2">
        <p className="text-sm font-semibold text-surface-800 dark:text-surface-100">1. 샤드 키</p>
        <ChoiceGroup label="샤드 키" options={KEY_OPTIONS} value={keyId} onChange={setKeyId} />
        <p className="text-sm leading-relaxed text-surface-600 dark:text-surface-300">{key.note}</p>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-semibold text-surface-800 dark:text-surface-100">2. 조회</p>
        <ChoiceGroup label="조회" options={QUERY_OPTIONS} value={queryId} onChange={setQueryId} />
      </div>

      <ShardDistribution shares={getDistribution(keyId)} targetShards={targetShards} />

      <div
        role="status"
        aria-live="polite"
        className={`rounded-xl border px-4 py-3 ${
          isSingleShard
            ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200'
            : 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100'
        }`}
      >
        <p className="font-mono text-xs font-semibold opacity-80">explain 단계: {stage}</p>
        <p className="mt-1 text-base font-bold">
          {isSingleShard ? `${targetShards[0]} 한 곳에만 물어요` : `${targetShards.join(', ')} 모두에 물어요`}
        </p>
        <p className="mt-0.5 text-sm leading-relaxed">
          {isSingleShard
            ? '조회 조건에 샤드 키가 들어 있어서 mongos가 담당 샤드를 바로 찾아요.'
            : '샤드 키만으로 담당 샤드를 하나로 좁힐 수 없어서, 모든 샤드에 물어보고 결과를 합쳐요.'}
        </p>
      </div>
    </DemoFrame>
  );
}
