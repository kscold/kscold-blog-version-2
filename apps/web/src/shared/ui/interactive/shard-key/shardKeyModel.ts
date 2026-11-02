// 샤드 키 데모의 계산. 메시지 수는 글의 실험과 같다(워크스페이스 10개, 그중 ws-07이 전체의 80%).
// 샤드는 두 개이고, 범위 샤딩은 실험에서 나눈 경계를 그대로 쓴다.

export type ShardName = 'shard-a' | 'shard-b';
export type ShardKeyId = 'workspace' | 'workspace-channel' | 'hashed-id';
export type RouteStage = 'SINGLE_SHARD' | 'SHARD_MERGE';

export const SHARD_NAMES: ShardName[] = ['shard-a', 'shard-b'];

interface MessageGroup {
  workspaceId: string;
  channelId: string;
  count: number;
}

type QueryFilter = Partial<Pick<MessageGroup, 'workspaceId' | 'channelId'>>;

export interface ShardKeyOption {
  id: ShardKeyId;
  label: string;
  fields: Array<'workspaceId' | 'channelId' | '_id'>;
  note: string;
}

export interface DemoQuery {
  id: string;
  code: string;
  filter: QueryFilter;
}

const HOT_WORKSPACE = 'ws-07';
const CHANNEL_COUNT = 8;

export const SHARD_KEYS: ShardKeyOption[] = [
  {
    id: 'workspace',
    label: '{ workspaceId: 1 }',
    fields: ['workspaceId'],
    note: '워크스페이스 하나는 한 샤드에 모여서 조회는 빠르지만, 큰 워크스페이스를 가진 샤드에 데이터가 몰려요.',
  },
  {
    id: 'workspace-channel',
    label: '{ workspaceId: 1, channelId: 1 }',
    fields: ['workspaceId', 'channelId'],
    note: '큰 워크스페이스를 채널 단위로 나눌 수 있어서 고르게 퍼져요. 대신 그 워크스페이스 전체 조회는 두 샤드에 물어요.',
  },
  {
    id: 'hashed-id',
    label: "{ _id: 'hashed' }",
    fields: ['_id'],
    note: '데이터는 반반으로 고르게 퍼지지만, 워크스페이스나 채널로 찾는 조회는 전부 모든 샤드에 물어요.',
  },
];

export const DEMO_QUERIES: DemoQuery[] = [
  { id: 'one-channel', code: "find({ workspaceId: 'ws-03', channelId: 'ch-1' })", filter: { workspaceId: 'ws-03', channelId: 'ch-1' } },
  { id: 'hot-workspace', code: "find({ workspaceId: 'ws-07' })", filter: { workspaceId: HOT_WORKSPACE } },
  { id: 'hot-channel', code: "find({ workspaceId: 'ws-07', channelId: 'ch-5' })", filter: { workspaceId: HOT_WORKSPACE, channelId: 'ch-5' } },
  { id: 'full-search', code: 'find({ text: /배포/ })', filter: {} },
];

// 실험처럼 메시지를 채널 8개에 차례로 나눠 담는다.
function buildMessageGroups(): MessageGroup[] {
  const groups: MessageGroup[] = [];
  for (let index = 1; index <= 10; index += 1) {
    const workspaceId = `ws-${String(index).padStart(2, '0')}`;
    const total = workspaceId === HOT_WORKSPACE ? 16000 : 444;
    for (let channel = 0; channel < CHANNEL_COUNT; channel += 1) {
      const count = Math.floor(total / CHANNEL_COUNT) + (channel < total % CHANNEL_COUNT ? 1 : 0);
      groups.push({ workspaceId, channelId: `ch-${channel}`, count });
    }
  }
  return groups;
}

const MESSAGE_GROUPS = buildMessageGroups();
const TOTAL_MESSAGES = MESSAGE_GROUPS.reduce((sum, group) => sum + group.count, 0);

/** 범위 샤딩은 샤드 하나를, 해시 샤딩은 문서를 모든 샤드에 고르게 흩는다는 뜻으로 null을 돌려준다. */
function findShard(keyId: ShardKeyId, group: MessageGroup): ShardName | null {
  if (keyId === 'hashed-id') return null;
  if (group.workspaceId < 'ws-06') return 'shard-a';
  // 샤드 키에 채널을 붙이면 ws-07의 앞쪽 채널(ch-0~ch-3)을 shard-a로 옮길 수 있다.
  const channelIndex = Number(group.channelId.replace('ch-', ''));
  if (keyId === 'workspace-channel' && group.workspaceId === HOT_WORKSPACE && channelIndex < 4) return 'shard-a';
  return 'shard-b';
}

export function getDistribution(keyId: ShardKeyId) {
  const docs: Record<ShardName, number> = { 'shard-a': 0, 'shard-b': 0 };
  for (const group of MESSAGE_GROUPS) {
    const shard = findShard(keyId, group);
    if (shard) {
      docs[shard] += group.count;
    } else {
      SHARD_NAMES.forEach(name => {
        docs[name] += group.count / SHARD_NAMES.length;
      });
    }
  }
  return SHARD_NAMES.map(shard => ({
    shard,
    docs: Math.round(docs[shard]),
    percent: Math.round((docs[shard] / TOTAL_MESSAGES) * 1000) / 10,
  }));
}

/** 조회 조건이 샤드 키의 앞부분을 담고 있을 때만 해당 샤드로 보내고, 아니면 모든 샤드에 묻는다. */
export function getTargetShards(keyId: ShardKeyId, filter: QueryFilter): ShardName[] {
  const key = SHARD_KEYS.find(option => option.id === keyId);
  const leadingField = key?.fields[0];
  if (!key || leadingField === '_id' || !leadingField || filter[leadingField] === undefined) return SHARD_NAMES;

  const keyFields = key.fields.filter((field): field is 'workspaceId' | 'channelId' => field !== '_id');
  const shards = new Set<ShardName>();
  for (const group of MESSAGE_GROUPS) {
    const isMatched = keyFields.every(field => filter[field] === undefined || filter[field] === group[field]);
    const shard = isMatched ? findShard(keyId, group) : undefined;
    if (shard) shards.add(shard);
  }
  return SHARD_NAMES.filter(name => shards.has(name));
}

export function getRouteStage(shards: ShardName[]): RouteStage {
  return shards.length === 1 ? 'SINGLE_SHARD' : 'SHARD_MERGE';
}

export function getTotalMessages() {
  return TOTAL_MESSAGES;
}
