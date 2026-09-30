import assert from 'node:assert/strict';
import { test } from 'node:test';
import { planRetention, runRetention } from './agent-backup-retention.mjs';

const NOW = Date.parse('2026-09-30T12:00:00Z');
const atHoursAgo = hours => new Date(NOW - hours * 3_600_000).toISOString();
const active = () => ({
  Id: 'active',
  Name: '/kscold-vault-agent',
  Image: 'sha256:current',
  Config: { Image: 'kscold/vault-agent:current' },
  State: {
    Status: 'running',
    Running: true,
    StartedAt: atHoursAgo(48),
    Health: { Status: 'healthy' },
  },
});
const backup = (id, age = 48) => ({
  Id: id,
  Name: `/kscold-vault-agent-backup-${id}`,
  Image: `sha256:${id}`,
  Config: { Image: `kscold/vault-agent:${id}` },
  State: { Status: 'exited', Running: false, FinishedAt: atHoursAgo(age) },
  Mounts: [],
  SizeRw: 4096,
});
const fixture = () => [active(), backup('newest', 46), backup('previous', 47), backup('old', 48)];

function clientWith(containers = fixture()) {
  const calls = [];
  const client = {
    snapshot: () => structuredClone(containers),
    removeContainer(id) {
      calls.push(['rm', id]);
      containers = containers.filter(item => item.Id !== id);
    },
    imageInUse: id => containers.some(item => item.Image === id),
    inspectImage: () => ({ RepoTags: ['kscold/vault-agent:old'] }),
    removeImage: id => calls.push(['rmi', id]),
  };
  return { client, calls };
}

test('최근 복구본 두 개를 중지 시각 기준으로 보존함', () => {
  const plan = planRetention(fixture().reverse(), NOW);
  assert.deepEqual(
    plan.keep.map(item => item.Id),
    ['newest', 'previous']
  );
  assert.deepEqual(
    plan.remove.map(item => item.Id),
    ['old']
  );
});

test('기본 실행은 삭제하지 않는 미리보기임', () => {
  const { client, calls } = clientWith();
  const report = runRetention({ client, now: NOW, pruneImages: true });
  assert.equal(report.candidates.length, 1);
  assert.deepEqual(calls, []);
});

test('운영 Agent 누락, 비정상, 헬스체크 누락, 재기동 직후에는 삭제하지 않음', () => {
  for (const condition of ['missing', 'unhealthy', 'no-health', 'starting', 'stopped']) {
    const containers = fixture();
    if (condition === 'missing') containers.shift();
    if (condition === 'unhealthy') containers[0].State.Health.Status = 'unhealthy';
    if (condition === 'no-health') delete containers[0].State.Health;
    if (condition === 'starting') containers[0].State.StartedAt = atHoursAgo(0.1);
    if (condition === 'stopped') containers[0].State.Running = false;
    const { client, calls } = clientWith(containers);
    assert.ok(runRetention({ client, now: NOW, apply: true }).blocked);
    assert.deepEqual(calls, []);
  }
});

test('중지된 지 하루 미만인 백업과 알 수 없는 시각은 보존함', () => {
  const containers = [
    active(),
    backup('one', 1),
    backup('two', 2),
    backup('three', 3),
    backup('invalid'),
  ];
  containers[4].State.FinishedAt = 'invalid';
  assert.deepEqual(planRetention(containers, NOW).remove, []);
  containers[4].State.FinishedAt = '0001-01-01T00:00:00Z';
  assert.deepEqual(planRetention(containers, NOW).remove, []);
});

test('볼륨, 쓰기 데이터, 다른 이미지, 다른 이름 또는 실행 중 백업은 보호함', () => {
  const mutations = [
    item => {
      item.Mounts = [{ Type: 'volume', Name: 'important' }];
    },
    item => {
      item.SizeRw = 2 * 1024 * 1024;
    },
    item => {
      delete item.SizeRw;
    },
    item => {
      delete item.Mounts;
    },
    item => {
      item.Config.Image = 'other/agent:old';
    },
    item => {
      item.Name = '/unrelated-backup';
    },
    item => {
      item.State.Status = 'running';
      item.State.Running = true;
    },
  ];
  for (const mutate of mutations) {
    const containers = fixture();
    mutate(containers[3]);
    assert.deepEqual(planRetention(containers, NOW).remove, []);
  }
});

test('삭제 직전 백업 상태 변경은 재검증으로 보호함', () => {
  const { client, calls } = clientWith();
  let reads = 0;
  client.snapshot = () => {
    const containers = fixture();
    if (++reads > 1) containers[3].Mounts.push({ Type: 'bind' });
    return containers;
  };
  runRetention({ client, now: NOW, apply: true });
  assert.deepEqual(calls, []);
});

test('정리 중 배포 또는 동일 컨테이너 재기동을 감지하면 중단함', () => {
  for (const key of ['Id', 'StartedAt']) {
    const { client, calls } = clientWith();
    let reads = 0;
    client.snapshot = () => {
      const containers = fixture();
      if (++reads > 1) {
        if (key === 'Id') containers[0].Id = 'replacement';
        else containers[0].State.StartedAt = atHoursAgo(24);
      }
      return containers;
    };
    assert.ok(runRetention({ client, now: NOW, apply: true }).blocked);
    assert.deepEqual(calls, []);
  }
});

test('선택된 오래된 백업과 그 전용 미사용 이미지만 제거함', () => {
  const { client, calls } = clientWith();
  const audit = [];
  const report = runRetention({
    client,
    now: NOW,
    apply: true,
    pruneImages: true,
    record: entry => audit.push(entry),
  });
  assert.deepEqual(calls, [
    ['rm', 'old'],
    ['rmi', 'sha256:old'],
  ]);
  assert.equal(report.removed.length, 1);
  assert.deepEqual(report.imagesRemoved, ['sha256:old']);
  assert.deepEqual(
    audit.map(entry => entry.action),
    ['container-remove-planned', 'container-removed', 'image-remove-planned', 'image-removed']
  );
  assert.equal(JSON.stringify(audit).includes('Config'), false);
});

test('보존 컨테이너가 공유하는 이미지는 제거하지 않음', () => {
  const containers = fixture();
  containers[2].Image = 'sha256:old';
  const { client, calls } = clientWith(containers);
  runRetention({ client, now: NOW, apply: true, pruneImages: true });
  assert.deepEqual(calls, [['rm', 'old']]);
});

test('다른 저장소 태그가 연결된 이미지는 보존함', () => {
  const { client, calls } = clientWith();
  client.inspectImage = () => ({ RepoTags: ['kscold/vault-agent:old', 'other/agent:important'] });
  runRetention({ client, now: NOW, apply: true, pruneImages: true });
  assert.deepEqual(calls, [['rm', 'old']]);
});

test('동일 저장소라도 별도 별칭이 있는 이미지는 보존함', () => {
  const { client, calls } = clientWith();
  client.inspectImage = () => ({
    RepoTags: ['kscold/vault-agent:old', 'kscold/vault-agent:archive'],
  });
  runRetention({ client, now: NOW, apply: true, pruneImages: true });
  assert.deepEqual(calls, [['rm', 'old']]);
});

test('이미지 삭제 직전 새 참조가 생기면 보존함', () => {
  const { client, calls } = clientWith();
  let checks = 0;
  client.imageInUse = () => ++checks > 1;
  runRetention({ client, now: NOW, apply: true, pruneImages: true });
  assert.deepEqual(calls, [['rm', 'old']]);
});

test('감사 기록 저장 실패 시 삭제를 진행하지 않음', () => {
  const { client, calls } = clientWith();
  assert.throws(() =>
    runRetention({
      client,
      now: NOW,
      apply: true,
      record: () => {
        throw new Error('disk full');
      },
    })
  );
  assert.deepEqual(calls, []);
});

test('Docker 삭제 실패 시 다른 항목까지 계속 삭제하지 않음', () => {
  const { client, calls } = clientWith();
  client.removeContainer = () => {
    throw new Error('container is running');
  };
  assert.throws(() => runRetention({ client, now: NOW, apply: true, pruneImages: true }));
  assert.deepEqual(calls, []);
});

test('반복 실행은 이미 정리된 컨테이너를 다시 삭제하지 않음', () => {
  const { client, calls } = clientWith();
  runRetention({ client, now: NOW, apply: true });
  const report = runRetention({ client, now: NOW, apply: true });
  assert.deepEqual(report.candidates, []);
  assert.deepEqual(calls, [['rm', 'old']]);
});

test('무보관 모드는 최근 두 복구본도 삭제하되 운영 컨테이너는 보존함', () => {
  const { client, calls } = clientWith();
  const report = runRetention({ client, now: NOW, apply: true, removeAllStopped: true });
  assert.deepEqual(report.keep, []);
  assert.deepEqual(calls, [
    ['rm', 'newest'],
    ['rm', 'previous'],
    ['rm', 'old'],
  ]);
  assert.deepEqual(
    client.snapshot().map(item => item.Id),
    ['active']
  );
});

test('무보관 모드도 24시간 유예와 볼륨 보호를 우회하지 않음', () => {
  const containers = [active(), backup('recent', 1), backup('data')];
  containers[2].Mounts = [{ Type: 'volume' }];
  const { client, calls } = clientWith(containers);
  runRetention({ client, now: NOW, apply: true, removeAllStopped: true });
  assert.deepEqual(calls, []);
});
