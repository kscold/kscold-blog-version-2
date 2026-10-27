'use client';

interface Props {
  isSubmitting: boolean;
  lastSavedText: string | null;
  submitLabel: string;
  onBack: () => void;
}

export function PostEditorSubmitPanel({ isSubmitting, lastSavedText, submitLabel, onBack }: Props) {
  return (
    <div className="space-y-4 rounded-3xl border border-surface-200 bg-white p-5 shadow-xs">
      <h3 className="text-base font-bold text-surface-900">저장</h3>
      <p className="text-xs leading-5 text-surface-600">작성 내용의 임시 보관은 이 브라우저에만 남습니다. 아래 버튼으로 서버에 저장해 주세요.</p>
      <p role="status" data-testid="post-autosave-status" className="text-xs leading-5 text-surface-500">{lastSavedText || '아직 브라우저에 임시 보관되지 않았습니다.'}</p>
      <button id="post-submit-button" type="submit" disabled={isSubmitting} data-testid="post-editor-submit"
        className="w-full rounded-full bg-surface-900 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">
        {isSubmitting ? '확인·저장 중…' : submitLabel}
      </button>
      <button type="button" onClick={onBack} disabled={isSubmitting}
        className="w-full rounded-full border border-surface-200 px-5 py-3 text-sm font-semibold text-surface-600">목록으로 돌아가기</button>
    </div>
  );
}
