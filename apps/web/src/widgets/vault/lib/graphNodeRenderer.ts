import type { RenderNodeOptions, NodeRuntime } from './graphForceTypes';
import { renderGraphLabel } from './graphForceLabels';
import { getNodeRadius, isDarkGraphTheme } from './graphForceUtils';
import { renderDetailedNode, renderReducedNode } from './graphNodeVariants';

export function renderNode(
  node: NodeRuntime,
  ctx: CanvasRenderingContext2D,
  globalScale: number,
  options: RenderNodeOptions
): void {
  if (node.x == null || node.y == null || !isFinite(node.x) || !isFinite(node.y)) return;

  try {
    const {
      activeNodeSlug,
      hoverNodeId,
      connectedIds,
      highlightFolderId,
      folderColorMap,
      theme,
      reducedEffects = false,
    } = options;
    const isFolder = Boolean(node.isFolder);
    const focused = activeNodeSlug === node.slug || hoverNodeId === node.id;
    const isDark = isDarkGraphTheme(theme);
    const nodeColor = folderColorMap[node.folderId ?? ''] || '#6E93C4';
    const radius = getNodeRadius(node);

    // 호버 포커스 모드: 호버 노드와 직접 연결되지 않은 노드는 흐린 원 하나로
    // 가라앉혀, 연결 관계만 또렷하게 떠오르도록 한다 (Obsidian 그래프 인터랙션).
    // 디테일 렌더(그라디언트·글로우)를 통째로 건너뛰므로 호버 중 성능도 좋아짐.
    const dimmedByHover = Boolean(
      hoverNodeId && !focused && connectedIds && !connectedIds.has(String(node.id))
    );
    // 사이드바 폴더 호버 연동: 해당 폴더 소속이 아닌 노드는 가라앉힘
    const inHighlightFolder =
      node.folderId === highlightFolderId || String(node.id) === highlightFolderId;
    const dimmedByFolder = Boolean(highlightFolderId && !inHighlightFolder);
    const dimmed = dimmedByHover || dimmedByFolder;

    if (dimmed) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(node.x!, node.y!, radius, 0, Math.PI * 2);
      ctx.fillStyle = nodeColor;
      ctx.globalAlpha = 0.12;
      ctx.fill();
      ctx.restore();
      return;
    }

    if (reducedEffects) {
      renderReducedNode(node, ctx, globalScale, focused, isFolder, nodeColor, radius);
    } else {
      renderDetailedNode(node, ctx, globalScale, focused, isFolder, isDark, nodeColor, radius);
    }

    const folderSpotlight = Boolean(highlightFolderId) && inHighlightFolder;
    if (isFolder || focused || folderSpotlight || globalScale > (reducedEffects ? 1.15 : 0.8)) {
      renderGraphLabel(node, ctx, globalScale, {
        label: node.name || '',
        isFolder,
        focused,
        isDark,
        radius,
        nodeColor,
      });
    }
  } catch {
    // 그래프가 처음 붙는 순간에는 캔버스 준비 과정에서 일시 오류가 날 수 있음.
  }
}
