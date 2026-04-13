type MarkdownNode = {
  type?: string;
  value?: string;
  children?: MarkdownNode[];
};

const looseStrongPattern = /\*\*([^\n]+?)\*\*/g;

function splitLooseStrong(value: string): MarkdownNode[] {
  if (!value.includes('**')) {
    return [{ type: 'text', value }];
  }

  const nodes: MarkdownNode[] = [];
  let lastIndex = 0;

  for (const match of value.matchAll(looseStrongPattern)) {
    const fullMatch = match[0];
    const strongValue = match[1];
    const matchIndex = match.index ?? -1;

    if (matchIndex < 0 || !strongValue) {
      continue;
    }

    if (matchIndex > lastIndex) {
      nodes.push({ type: 'text', value: value.slice(lastIndex, matchIndex) });
    }

    nodes.push({
      type: 'strong',
      children: [{ type: 'text', value: strongValue }],
    });

    lastIndex = matchIndex + fullMatch.length;
  }

  if (!nodes.length) {
    return [{ type: 'text', value }];
  }

  if (lastIndex < value.length) {
    nodes.push({ type: 'text', value: value.slice(lastIndex) });
  }

  return nodes;
}

function walk(node: MarkdownNode) {
  if (!Array.isArray(node.children) || node.children.length === 0) {
    return;
  }

  const nextChildren: MarkdownNode[] = [];

  for (const child of node.children) {
    if (child.type === 'text' && typeof child.value === 'string') {
      nextChildren.push(...splitLooseStrong(child.value));
      continue;
    }

    walk(child);
    nextChildren.push(child);
  }

  node.children = nextChildren;
}

export function remarkLooseStrong() {
  return (tree: MarkdownNode) => {
    walk(tree);
  };
}
