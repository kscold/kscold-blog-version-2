import { AnimatePresence, motion } from 'framer-motion';
import type { LinkPreview } from '@/types/social';
import { LinkPreviewCard } from '@/shared/ui/LinkPreviewCard';
import { ImagePreviewScroll } from './ImagePreviewScroll';

interface FeedComposerExpandedPanelsProps {
  shouldShowExpanded: boolean;
  images: string[];
  linkUrl: string;
  linkPreview: LinkPreview | null | undefined;
  onRemoveImage: (index: number) => void;
  onLinkUrlChange: (value: string) => void;
  onExpand: () => void;
}

export function FeedComposerExpandedPanels({
  shouldShowExpanded,
  images,
  linkUrl,
  linkPreview,
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
              onChange={event => {
                onLinkUrlChange(event.target.value);
                onExpand();
              }}
              placeholder="링크를 붙여 넣으면 미리보기가 바로 준비됩니다."
              data-cy="feed-composer-link-input"
              className="w-full rounded-2xl border border-surface-200 bg-white px-4 py-3 text-sm text-surface-700 placeholder:text-surface-400 focus:outline-none focus:ring-1 focus:ring-surface-900"
            />
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
