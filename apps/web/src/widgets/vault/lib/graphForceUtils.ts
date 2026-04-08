import type { NodeRuntime } from './graphForceTypes';

export function getCollisionRadius(node: NodeRuntime) {
  return node.isFolder
    ? Math.sqrt(node.val || 10) * 4.5
    : Math.sqrt(node.val || 4) * 3;
}

export function getNodeRadius(node: NodeRuntime) {
  return node.isFolder
    ? Math.sqrt(node.val || 10) * 4.5
    : Math.sqrt(node.val || 1) * 3;
}

export function getHitRadius(node: NodeRuntime) {
  return node.isFolder
    ? Math.sqrt(node.val || 10) * 3.5
    : Math.sqrt(node.val || 1) * 2.5;
}

export function isDarkGraphTheme(theme: 'light' | 'dark' | 'system') {
  return (
    theme === 'dark' ||
    (theme === 'system' &&
      typeof document !== 'undefined' &&
      document.documentElement.classList.contains('dark'))
  );
}
