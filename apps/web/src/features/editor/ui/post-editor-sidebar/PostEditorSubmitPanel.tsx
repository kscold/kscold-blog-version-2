'use client';

interface PostEditorSubmitPanelProps {
  isSubmitting: boolean;
  lastSavedText: string | null;
  mode: 'create' | 'edit';
  onBack: () => void;
}

export function PostEditorSubmitPanel({
  isSubmitting,
  lastSavedText,
  mode,
  onBack,
}: PostEditorSubmitPanelProps) {
  return (
    <div className="rounded-[28px] border border-surface-200 bg-surface-900 p-5 text-white shadow-[0_20px_50px_rgba(15,23,42,0.14)]">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/50">
        Ready
      </p>
      <h3 className="mt-3 text-xl font-black tracking-tight">
        문서 상태를 저장합니다
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-white/70">
        작성 중인 초안은 자동 저장되고, 여기서 발행 상태와 함께 최종 저장할 수 있습니다.
      </p>

      {lastSavedText && (
        <p className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
          {lastSavedText}
        </p>
      )}

      <div className="mt-5 space-y-3">
        <button
          type="submit"
          disabled={isSubmitting}
          data-cy="post-editor-submit"
          className="w-full rounded-full bg-white px-6 py-3 font-semibold text-surface-900 transition-colors hover:bg-surface-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? '저장 중...' : mode === 'create' ? '포스트 저장' : '변경사항 저장'}
        </button>

        <button
          type="button"
          onClick={onBack}
          className="w-full rounded-full border border-white/15 bg-white/5 px-6 py-3 font-semibold text-white transition-colors hover:bg-white/10"
        >
          목록으로 돌아가기
        </button>
      </div>
    </div>
  );
}
