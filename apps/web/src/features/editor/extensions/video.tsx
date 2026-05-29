'use client';

import { Node, mergeAttributes, type NodeViewProps } from '@tiptap/react';
import { NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react';

/**
 * 에디터 안에서 mp4/webm/mov 동영상을 미리보기로 보여주는 노드 뷰.
 * 삭제 버튼으로 노드를 제거할 수 있다.
 */
function VideoView({ node, deleteNode }: NodeViewProps) {
  const src: string = node.attrs.src || '';

  return (
    <NodeViewWrapper>
      <div
        className="editor-video group relative my-4"
        contentEditable={false}
        data-drag-handle
      >
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video
          src={src}
          controls
          preload="metadata"
          className="w-full rounded-2xl border border-surface-200 shadow-sm"
        />
        <button
          type="button"
          onClick={() => deleteNode()}
          className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-sm font-bold text-white opacity-0 transition-opacity group-hover:opacity-100"
          title="동영상 제거"
        >
          ×
        </button>
      </div>
    </NodeViewWrapper>
  );
}

export const VideoExtension = Node.create({
  name: 'video',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute('src'),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'video[src]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['video', mergeAttributes(HTMLAttributes, { controls: 'true' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(VideoView);
  },

  addStorage() {
    return {
      markdown: {
        // 동영상은 단독 URL 한 줄로 직렬화한다.
        // (프론트 마크다운 렌더러가 단독 동영상 URL을 VideoPlayer로 렌더)
        serialize(state: any, node: any) {
          if (node.attrs.src) {
            state.write(node.attrs.src);
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
