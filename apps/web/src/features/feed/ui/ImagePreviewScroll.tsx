'use client';

import Image from 'next/image';

interface ImagePreviewScrollProps {
  images: string[];
  onRemove: (index: number) => void;
  dataCy?: string;
}

export function ImagePreviewScroll({ images, onRemove, dataCy }: ImagePreviewScrollProps) {
  if (images.length === 0) return null;

  return (
    <div data-cy={dataCy} className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-surface-900">이미지 첨부</p>
          <p className="mt-1 text-sm text-surface-500">
            작업 캡처나 참고 이미지를 함께 남겨보세요.
          </p>
        </div>
        <span className="rounded-full border border-surface-200 bg-white px-3 py-1 text-xs font-semibold text-surface-500">
          {images.length}장
        </span>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1">
        {images.map((url, i) => (
          <div
            key={i}
            className="relative h-28 w-28 flex-shrink-0 overflow-hidden rounded-[22px] border border-surface-200 bg-surface-100 sm:h-32 sm:w-32"
          >
            <Image src={url} alt="" fill sizes="128px" className="object-cover" />
            <button
              type="button"
              onClick={() => onRemove(i)}
              aria-label={`이미지 ${i + 1} 삭제`}
              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/55 text-white transition-colors hover:bg-black/75"
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
