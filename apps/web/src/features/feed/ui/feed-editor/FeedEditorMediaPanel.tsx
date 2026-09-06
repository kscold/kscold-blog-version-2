import { ImagePreviewGrid } from '@/features/feed/ui/ImagePreviewGrid';
import { FEED_INPUT_LIMITS } from '@/entities/feed';

interface FeedEditorMediaPanelProps {
  images: string[];
  error: string | null;
  onRemove: (index: number) => void;
}

export function FeedEditorMediaPanel({ images, error, onRemove }: FeedEditorMediaPanelProps) {
  return (
    <div className="rounded-[28px] border border-surface-200 bg-surface-50/70 p-5 sm:p-6">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-surface-900">첨부 이미지</p>
        <p className="text-xs font-semibold text-surface-500">
          {images.length} / {FEED_INPUT_LIMITS.imageCount}장
        </p>
      </div>
      {images.length > 0 ? (
        <ImagePreviewGrid images={images} onRemove={onRemove} dataCy="feed-editor-images" />
      ) : (
        <div
          data-cy="feed-editor-images"
          className="rounded-[24px] border border-dashed border-surface-200 bg-white px-5 py-8 text-center"
        >
          <p className="text-base font-semibold text-surface-900">아직 첨부된 이미지가 없습니다</p>
          <p className="mt-2 text-sm leading-relaxed text-surface-500">
            오른쪽 설정 패널에서 이미지를 추가하거나, 본문에 이미지를 붙여넣어 바로 업로드할 수
            있습니다.
          </p>
        </div>
      )}
      {error ? (
        <p
          role="alert"
          data-cy="feed-editor-image-error"
          className="mt-3 text-sm font-semibold text-red-500"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
