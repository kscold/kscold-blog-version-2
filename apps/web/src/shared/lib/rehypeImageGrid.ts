// rehype 플러그인: hast p 노드를 직접 수정 (remark→rehype 데이터 전달 불필요)
function walk(node: any, fn: (n: any) => void) {
  fn(node);
  if (Array.isArray(node.children)) {
    node.children.forEach((child: any) => walk(child, fn));
  }
}

interface RehypeImageGridOptions {
  prioritizeFirstImage?: boolean;
}

export function rehypeImageGrid({ prioritizeFirstImage = false }: RehypeImageGridOptions = {}) {
  return (tree: any) => {
    let hasPriorityImage = false;

    walk(tree, (node: any) => {
      if (
        prioritizeFirstImage &&
        !hasPriorityImage &&
        node.type === 'element' &&
        node.tagName === 'img'
      ) {
        node.properties = {
          ...(node.properties ?? {}),
          dataPriorityImage: true,
        };
        hasPriorityImage = true;
      }

      if (node.type !== 'element' || node.tagName !== 'p') return;
      const children: any[] = node.children ?? [];
      const nonWs = children.filter(
        (c: any) => !(c.type === 'text' && c.value.trim() === ''),
      );
      const imgs = nonWs.filter(
        (c: any) => c.type === 'element' && c.tagName === 'img',
      );
      if (imgs.length >= 2 && imgs.length === nonWs.length) {
        node.tagName = 'div';
        node.properties = {
          ...(node.properties ?? {}),
          className: ['md-image-grid', `md-image-grid-${imgs.length}`],
        };
      }
    });
  };
}
