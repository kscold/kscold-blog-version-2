'use client';

import { Node, mergeAttributes, type NodeViewProps } from '@tiptap/react';
import { NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react';
import { useMediaUpload } from '@/shared/lib/useMediaUpload';

function ImageRowView({ node, updateAttributes, deleteNode }: NodeViewProps) {
  const { uploadFile, isUploading } = useMediaUpload();
  const srcs: string[] = node.attrs.srcs || [];

  const removeImage = (index: number) => {
    const next = srcs.filter((_, i) => i !== index);
    if (next.length === 0) {
      deleteNode();
    } else {
      updateAttributes({ srcs: next });
    }
  };

  const addImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        const url = await uploadFile(file);
        updateAttributes({ srcs: [...srcs, url] });
      } catch {
        // 업로드 실패는 조용히 건너뜀
      }
    };
    input.click();
  };

  const colClass =
    srcs.length <= 1
      ? 'grid-cols-1'
      : srcs.length === 2
        ? 'grid-cols-2'
        : 'grid-cols-3';

  return (
    <NodeViewWrapper>
      <div
        className={`editor-image-row my-4 grid gap-2 rounded-2xl ${colClass}`}
        contentEditable={false}
        data-drag-handle
      >
        {srcs.map((src, i) => (
          <div key={src + i} className="group relative overflow-hidden rounded-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt=""
              className="h-48 w-full object-cover"
            />
            <button
              type="button"
              onClick={() => removeImage(i)}
              className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-sm font-bold text-white opacity-0 transition-opacity group-hover:opacity-100"
              title="이미지 제거"
            >
              ×
            </button>
          </div>
        ))}
        {srcs.length < 3 && (
          <button
            type="button"
            onClick={addImage}
            disabled={isUploading}
            className="flex h-48 items-center justify-center rounded-xl border-2 border-dashed border-surface-300 text-sm text-surface-400 transition-colors hover:border-surface-500 hover:text-surface-600 disabled:opacity-50"
          >
            {isUploading ? '업로드 중…' : '+ 이미지 추가'}
          </button>
        )}
      </div>
    </NodeViewWrapper>
  );
}

export const ImageRowExtension = Node.create({
  name: 'imageRow',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      srcs: {
        default: [],
        parseHTML: (element: HTMLElement) => {
          const attr = element.getAttribute('data-image-row');
          return attr ? attr.split(',').filter(Boolean) : [];
        },
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-image-row]' }];
  },

  renderHTML({ node, HTMLAttributes }) {
    const srcs: string[] = (node.attrs.srcs as string[]) || [];
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-image-row': srcs.join(','),
        class: 'editor-image-row',
      }),
      0,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageRowView);
  },

  addStorage() {
    return {
      markdown: {
        serialize(state: any, node: any) {
          const srcs: string[] = node.attrs.srcs || [];
          if (srcs.length > 0) {
            state.write(srcs.map((src: string) => `![](${src})`).join('\n'));
            state.closeBlock(node);
          }
        },
        parse: {
          setup() {},
          updateDOM() {},
        },
      },
    };
  },
});
