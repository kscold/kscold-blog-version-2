import { AnimatePresence, motion } from 'framer-motion';
import { FEED_INPUT_LIMITS } from '@/entities/feed';
import type { LinkPreview } from '@/shared/model/types/social';
import { LinkPreviewCard } from '@/shared/ui/LinkPreviewCard';
import { ImagePreviewScroll } from './ImagePreviewScroll';

interface FeedComposerExpandedPanelsProps {
  shouldShowExpanded: boolean;
  images: string[];
  linkUrl: string;
  linkPreview: LinkPreview | null | undefined;
  imageError: string | null;
  linkError: string | null;
  onRemoveImage: (index: number) => void;
  onLinkUrlChange: (value: string) => void;
  onExpand: () => void;
}

export function FeedComposerExpandedPanels({
  shouldShowExpanded,
  images,
  linkUrl,
  linkPreview,
  imageError,
  linkError,
  onRemoveImage,
  onLinkUrlChange,
  onExpand,
}: FeedComposerExpandedPanelsProps) {
  return (
    <AnimatePresence initial={false}>
      {shouldShowExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-5 overflow-hidden"
        >
          <div className="rounded-[28px] border border-surface-200 bg-surface-50/70 p-5 sm:p-6">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-surface-900">첨부 이미지</p>
              <p className="text-xs font-semibold text-surface-500">
                {images.length} / {FEED_INPUT_LIMITS.imageCount}장
              </p>
            </div>
            {images.length > 0 ? (
              <ImagePreviewScroll
                images={images}
                onRemove={onRemoveImage}
                dataCy="feed-composer-images"
              />
            ) : (
              <div
                data-cy="feed-composer-images"
                className="rounded-[24px] border border-dashed border-surface-200 bg-white px-5 py-8 text-center"
              >
                <p className="text-base font-semibold text-surface-900">아직 첨부된 이미지가 없습니다</p>
                <p className="mt-2 text-sm leading-6 text-surface-500">
                  아래 버튼으로 이미지를 고르거나, 본문에 붙여넣어서 바로 올릴 수 있습니다.
                </p>
              </div>
            )}
            {imageError ? (
              <p
                role="alert"
                data-cy="feed-composer-image-error"
                className="mt-3 text-sm font-semibold text-red-500"
              >
                {imageError}
              </p>
            ) : null}
          </div>

          <div
            data-cy="feed-composer-link"
            className="rounded-[28px] border border-surface-200 bg-surface-50/70 p-5 sm:p-6"
          >
            <div className="mb-3">
              <p className="text-sm font-semibold text-surface-900">링크 미리보기</p>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-surface-500">
                참고 자료나 함께 보고 싶은 페이지가 있다면 링크를 붙여 주세요.
              </p>
            </div>
            <input
              type="url"
              value={linkUrl}
              maxLength={FEED_INPUT_LIMITS.linkUrlLength}
              onChange={event => {
                onLinkUrlChange(event.target.value);
                onExpand();
              }}
              placeholder="링크를 붙여 넣으면 미리보기가 바로 준비됩니다."
              data-cy="feed-composer-link-input"
              aria-invalid={Boolean(linkError)}
              aria-describedby={
                linkError ? 'feed-composer-link-error' : 'feed-composer-link-count'
              }
              className="w-full rounded-2xl border border-surface-200 bg-white px-4 py-3 text-sm text-surface-700 placeholder:text-surface-400 focus:outline-none focus:ring-1 focus:ring-surface-900"
            />
            <div className="mt-2 flex items-start justify-between gap-3 text-xs">
              {linkError ? (
                <p
                  id="feed-composer-link-error"
                  role="alert"
                  data-cy="feed-composer-link-error"
                  className="font-semibold text-red-500"
                >
                  {linkError}
                </p>
              ) : null}
              <p id="feed-composer-link-count" className="ml-auto shrink-0 text-surface-400">
                {linkUrl.length.toLocaleString('ko-KR')} /{' '}
                {FEED_INPUT_LIMITS.linkUrlLength.toLocaleString('ko-KR')}자
              </p>
            </div>
            {linkPreview?.title && (
              <div className="mt-4">
                <LinkPreviewCard preview={linkPreview} />
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
