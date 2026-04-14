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
          <p className="mt-1 max-w-2xl text-sm leading-6 text-surface-500">
            지금 만들고 있는 것, 막 배운 점, 같이 보고 싶은 링크의 맥락을 남겨 주세요.
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
        placeholder="지금 하고 있는 작업, 막 떠오른 생각, 함께 보고 싶은 링크 이야기를 편하게 남겨보세요."
        rows={shouldShowExpanded ? 8 : 3}
        data-cy="feed-composer-content"
        className="min-h-[140px] w-full resize-none border-0 bg-transparent p-0 text-base leading-8 text-surface-900 placeholder:text-surface-300 focus:outline-none sm:min-h-[180px] sm:text-[1.05rem]"
      />

      <p className="mt-4 text-sm leading-6 text-surface-400">
        이미지는 이 영역에 드래그하거나 붙여넣으면 바로 첨부됩니다.
      </p>
    </div>
  );
}
