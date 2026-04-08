interface FeedComposerEditorCardProps {
  content: string;
  shouldShowExpanded: boolean;
  onContentChange: (value: string) => void;
  onExpand: () => void;
  onPaste: (event: React.ClipboardEvent<HTMLTextAreaElement>) => Promise<void>;
  onDrop: (event: React.DragEvent<HTMLDivElement>) => Promise<void>;
}

export function FeedComposerEditorCard({
  content,
  shouldShowExpanded,
  onContentChange,
  onExpand,
  onPaste,
  onDrop,
}: FeedComposerEditorCardProps) {
  return (
    <div
      className="rounded-[28px] border border-surface-200 bg-white p-5 sm:p-6"
      onDragOver={event => {
        event.preventDefault();
        event.stopPropagation();
      }}
      onDrop={event => void onDrop(event)}
    >
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-surface-900">피드 본문</p>
          <p className="mt-1 text-sm text-surface-500">
            오늘 만들고 있는 것, 배운 점, 공유하고 싶은 링크의 맥락을 적어 주세요.
          </p>
        </div>
        <span className="rounded-full border border-surface-200 bg-surface-50 px-3 py-1 text-xs font-semibold text-surface-500">
          {content.trim().length}자
        </span>
      </div>

      <textarea
        value={content}
        onChange={event => {
          onContentChange(event.target.value);
          onExpand();
        }}
        onFocus={onExpand}
        onPaste={event => void onPaste(event)}
        placeholder="지금 떠오른 생각, 작업 진행 상황, 링크를 공유하고 싶은 이유를 편하게 적어보세요."
        rows={shouldShowExpanded ? 8 : 3}
        data-cy="feed-composer-content"
        className="min-h-[140px] w-full resize-none border-0 bg-transparent p-0 text-base leading-8 text-surface-900 placeholder:text-surface-300 focus:outline-none sm:min-h-[180px] sm:text-[1.05rem]"
      />

      <p className="mt-4 text-sm text-surface-400">
        이미지를 이 영역에 드래그하거나 붙여넣으면 바로 첨부됩니다.
      </p>
    </div>
  );
}
