interface FeedEditorContentPanelProps {
  content: string;
  isEditing: boolean;
  onChange: (value: string) => void;
  onPaste: (event: React.ClipboardEvent<HTMLTextAreaElement>) => Promise<void>;
  onDrop: (event: React.DragEvent<HTMLDivElement>) => Promise<void>;
}

export function FeedEditorContentPanel({
  content,
  isEditing,
  onChange,
  onPaste,
  onDrop,
}: FeedEditorContentPanelProps) {
  return (
    <section
      data-cy="feed-editor-surface"
      className="overflow-hidden rounded-[32px] border border-surface-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.06)]"
    >
      <div className="border-b border-surface-200 bg-surface-50/80 px-5 py-5 sm:px-8">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-surface-400">
            Writing Flow
          </p>
          <h2 className="text-3xl font-black tracking-tight text-surface-900 sm:text-4xl">
            {isEditing ? '기록을 다듬고 있습니다' : '지금 떠오른 흐름을 남겨 보세요'}
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-surface-500 sm:text-base">
            본문을 먼저 쓰고, 필요한 이미지는 붙여넣거나 드래그해서 더해 주세요. 링크가 있다면
            카드 미리보기까지 한 번에 확인할 수 있습니다.
          </p>
        </div>
      </div>

      <div className="space-y-6 px-5 py-6 sm:px-8 sm:py-8">
        <div
          className="rounded-[28px] border border-surface-200 bg-white p-5 sm:p-6"
          onDragOver={event => {
            event.preventDefault();
            event.stopPropagation();
          }}
          onDrop={event => void onDrop(event)}
        >
          <div className="mb-4">
            <p className="text-sm font-semibold text-surface-900">본문</p>
            <p className="mt-1 text-sm text-surface-500">
              오늘 공유하고 싶은 생각이나 작업 맥락을 자유롭게 적어 주세요.
            </p>
          </div>
          <textarea
            value={content}
            onChange={event => onChange(event.target.value)}
            onPaste={event => void onPaste(event)}
            placeholder="방금 만들고 있는 것, 떠오른 생각, 공유하고 싶은 링크의 맥락을 편하게 적어보세요."
            rows={10}
            data-cy="feed-editor-content"
            className="min-h-[260px] w-full resize-none border-0 bg-transparent p-0 text-lg leading-8 text-surface-900 placeholder:text-surface-300 focus:outline-none sm:text-[1.15rem]"
          />
          <p className="mt-4 text-sm text-surface-400">
            이미지를 이 영역에 드래그하거나 붙여넣으면 바로 첨부됩니다.
          </p>
        </div>
      </div>
    </section>
  );
}
