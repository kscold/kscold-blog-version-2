import type { LinkPreview } from '@/types/social';
import { LinkPreviewCard } from '@/shared/ui/LinkPreviewCard';

interface FeedEditorLinkPanelProps {
  linkUrl: string;
  linkPreview: LinkPreview | undefined;
  onChange: (value: string) => void;
}

export function FeedEditorLinkPanel({
  linkUrl,
  linkPreview,
  onChange,
}: FeedEditorLinkPanelProps) {
  return (
    <div
      data-cy="feed-editor-link"
      className="rounded-[28px] border border-surface-200 bg-surface-50/70 p-5 sm:p-6"
    >
      <div className="mb-3">
        <p className="text-sm font-semibold text-surface-900">링크 미리보기</p>
        <p className="mt-1 text-sm text-surface-500">
          참고 자료나 공유하고 싶은 서비스 링크를 붙여두면 카드 형태로 정리됩니다.
        </p>
      </div>
      <input
        type="url"
        value={linkUrl}
        onChange={event => onChange(event.target.value)}
        placeholder="https://example.com"
        data-cy="feed-editor-link-input"
        className="w-full rounded-2xl border border-surface-200 bg-white px-4 py-3 text-sm text-surface-700 placeholder:text-surface-400 focus:outline-none focus:ring-1 focus:ring-surface-900"
      />
      {linkPreview?.title && (
        <div className="mt-4">
          <LinkPreviewCard preview={linkPreview} />
        </div>
      )}
    </div>
  );
}
