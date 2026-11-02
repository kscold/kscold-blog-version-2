import { useCallback, useEffect, useRef, useState } from 'react';
import { createNodes, pickPrimary, toggleNode, type NodeCount, type ReplicaNode } from './replicaSetModel';

// 실제 선거는 기본 설정에서 보통 10~12초 걸린다. 데모에서는 흐름만 보이도록 짧게 줄인다.
export const DEMO_ELECTION_MS = 1200;

interface ElectionState {
  nodeCount: NodeCount;
  nodes: ReplicaNode[];
  primaryId: string | null;
  isElecting: boolean;
}

function createInitialState(nodeCount: NodeCount): ElectionState {
  return { nodeCount, nodes: createNodes(nodeCount), primaryId: 'A', isElecting: false };
}

export function useReplicaSetElection(defaultCount: NodeCount = 3) {
  const [state, setState] = useState(() => createInitialState(defaultCount));
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearElectionTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
  }, []);

  useEffect(() => clearElectionTimer, [clearElectionTimer]);

  const changeNodeCount = useCallback(
    (nodeCount: NodeCount) => {
      clearElectionTimer();
      setState(createInitialState(nodeCount));
    },
    [clearElectionTimer],
  );

  const toggle = (nodeId: string) => {
    clearElectionTimer();
    const nodes = toggleNode(state.nodes, nodeId);
    const candidate = pickPrimary(nodes, state.primaryId);

    // 과반이 깨졌거나 Primary가 그대로면 선거 없이 바로 반영한다.
    if (candidate === null || candidate === state.primaryId) {
      setState({ ...state, nodes, primaryId: candidate, isElecting: false });
      return;
    }

    // Primary가 빠졌거나 과반이 다시 모였으면 잠깐 선거를 거친 뒤 새 Primary를 정한다.
    setState({ ...state, nodes, primaryId: null, isElecting: true });
    timerRef.current = setTimeout(() => {
      setState(current => ({ ...current, primaryId: pickPrimary(current.nodes, null), isElecting: false }));
    }, DEMO_ELECTION_MS);
  };

  const reset = () => changeNodeCount(state.nodeCount);

  return { ...state, toggle, changeNodeCount, reset };
}
