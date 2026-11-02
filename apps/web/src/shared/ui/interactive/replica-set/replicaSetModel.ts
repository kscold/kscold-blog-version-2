// 레플리카셋 선거 데모의 계산.
// 모든 노드가 데이터와 투표권을 가지고, 켜진 노드끼리는 서로 통신할 수 있다고 가정한다.

export const NODE_COUNT_OPTIONS = [2, 3, 5] as const;

export type NodeCount = (typeof NODE_COUNT_OPTIONS)[number];

export interface ReplicaNode {
  id: string;
  isOnline: boolean;
}

export type NodeRole = 'primary' | 'secondary' | 'electing' | 'offline';

const NODE_NAMES = ['A', 'B', 'C', 'D', 'E'];

export function createNodes(count: NodeCount): ReplicaNode[] {
  return NODE_NAMES.slice(0, count).map(id => ({ id, isOnline: true }));
}

/** 과반은 투표 멤버 수의 절반보다 많은 가장 작은 인원이다. */
export function getMajority(memberCount: number) {
  return Math.floor(memberCount / 2) + 1;
}

export function countOnline(nodes: ReplicaNode[]) {
  return nodes.filter(node => node.isOnline).length;
}

export function hasMajority(nodes: ReplicaNode[]) {
  return countOnline(nodes) >= getMajority(nodes.length);
}

/**
 * 과반이 모이면 지금 Primary를 그대로 두고, Primary가 빠졌으면 켜진 노드 중 앞선 노드를 뽑는다.
 * 실제 MongoDB는 우선순위와 복제 진행 정도로 고르지만, 데모에서는 이름 순서로 단순하게 정한다.
 */
export function pickPrimary(nodes: ReplicaNode[], currentPrimaryId: string | null): string | null {
  if (!hasMajority(nodes)) return null;

  const onlineNodes = nodes.filter(node => node.isOnline);
  if (currentPrimaryId && onlineNodes.some(node => node.id === currentPrimaryId)) {
    return currentPrimaryId;
  }
  return onlineNodes[0]?.id ?? null;
}

export function toggleNode(nodes: ReplicaNode[], nodeId: string): ReplicaNode[] {
  return nodes.map(node => (node.id === nodeId ? { ...node, isOnline: !node.isOnline } : node));
}

export function getNodeRole(node: ReplicaNode, primaryId: string | null, isElecting: boolean): NodeRole {
  if (!node.isOnline) return 'offline';
  if (isElecting) return 'electing';
  return node.id === primaryId ? 'primary' : 'secondary';
}
