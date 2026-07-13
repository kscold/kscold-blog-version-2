'use client';

import type { ToolbarButtonConfig } from '@/features/editor/model/tiptapToolbar';
import { TiptapToolbar } from '@/features/editor/ui/TiptapToolbar';

interface EditorSurfaceHeaderProps {
  isUploading: boolean;
  primaryButtons: ToolbarButtonConfig[];
  blockButtons: ToolbarButtonConfig[];
}

export function EditorSurfaceHeader({
  isUploading,
  primaryButtons,
  blockButtons,
}: EditorSurfaceHeaderProps) {
  return (
    <div className="sticky top-0 z-10 border-b border-surface-200 bg-white/95 backdrop-blur-sm">
      <div className="flex flex-col gap-3 px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-surface-400">
              Editor Surface
            </p>
            <p className="mt-1 text-sm text-surface-500">
              문서 위에서 바로 서식을 바꾸고, 이미지는 붙여넣기나 드래그로 빠르게 넣을 수
              있습니다.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-surface-200 bg-surface-50 px-3 py-1.5 text-xs font-medium text-surface-500">
            <span className={`h-2 w-2 rounded-full ${isUploading ? 'bg-amber-500' : 'bg-emerald-500'}`} />
            {isUploading ? '이미지 업로드 중' : '문서 편집 준비됨'}
          </div>
        </div>

        <TiptapToolbar buttons={primaryButtons} dataCy="post-editor-toolbar" />
        <TiptapToolbar buttons={blockButtons} dataCy="post-editor-quick-actions" />
      </div>
    </div>
  );
}
