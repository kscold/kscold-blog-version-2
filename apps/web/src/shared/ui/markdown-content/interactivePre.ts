import { findInteractiveDemoId, type InteractiveDemoId } from '@/shared/ui/interactive/interactiveDemoIds';

interface HastNode {
  type?: string;
  tagName?: string;
  value?: string;
  properties?: { className?: unknown };
  children?: HastNode[];
}

function readText(node: HastNode): string {
  if (node.type === 'text') return node.value ?? '';
  return (node.children ?? []).map(readText).join('');
}

/**
 * 마크다운의 ```interactive 코드 블록이 등록된 데모를 가리키면 그 이름을 돌려준다.
 * 데모는 코드 블록용 pre 상자 밖에 그려야 하므로 pre를 그리기 전에 이 값으로 가른다.
 */
export function findInteractiveDemoInPre(node: unknown): InteractiveDemoId | null {
  const code = (node as HastNode | undefined)?.children?.find(child => child.tagName === 'code');
  const className = code?.properties?.className;
  const classNames = Array.isArray(className) ? className.map(String) : [String(className ?? '')];
  if (!code || !classNames.includes('language-interactive')) return null;

  return findInteractiveDemoId(readText(code));
}
