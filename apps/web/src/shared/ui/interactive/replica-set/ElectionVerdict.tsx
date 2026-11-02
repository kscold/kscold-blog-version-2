interface ElectionVerdictProps {
  onlineCount: number;
  nodeCount: number;
  majority: number;
  primaryId: string | null;
  isElecting: boolean;
}

const TONES = {
  ok: 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200',
  wait: 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100',
  stop: 'border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200',
};

function describe({ onlineCount, majority, primaryId, isElecting }: ElectionVerdictProps) {
  if (isElecting) {
    return {
      tone: TONES.wait,
      headline: '선거 중',
      detail: '남은 노드끼리 새 Primary를 뽑는 동안 쓰기가 잠깐 멈춰요. 실제로는 10~12초쯤 걸려요.',
    };
  }
  if (primaryId) {
    return {
      tone: TONES.ok,
      headline: `쓰기 가능 · Primary는 노드 ${primaryId}`,
      detail: `켜진 노드가 과반(${majority}대)을 넘어서 Primary를 유지할 수 있어요.`,
    };
  }
  if (onlineCount === 0) {
    return { tone: TONES.stop, headline: '쓰기 멈춤', detail: '모든 노드가 꺼졌어요.' };
  }
  return {
    tone: TONES.stop,
    headline: '쓰기 멈춤 · Primary 없음',
    detail: `켜진 노드가 ${onlineCount}대라 과반(${majority}대)에 못 미쳐요. 남은 노드는 SECONDARY로만 남고 쓰기를 받지 않아요.`,
  };
}

export function ElectionVerdict(props: ElectionVerdictProps) {
  const verdict = describe(props);

  return (
    <div role="status" aria-live="polite" className={`rounded-xl border px-4 py-3 ${verdict.tone}`}>
      <p className="text-xs font-medium opacity-80">
        켜진 노드 {props.onlineCount}/{props.nodeCount}대 · 과반 {props.majority}대
      </p>
      <p className="mt-1 text-base font-bold">{verdict.headline}</p>
      <p className="mt-0.5 text-sm leading-relaxed">{verdict.detail}</p>
    </div>
  );
}
