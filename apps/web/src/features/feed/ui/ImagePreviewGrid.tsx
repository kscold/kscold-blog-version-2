'use client';

import Image from 'next/image';

interface ImagePreviewGridProps {
  images: string[];
  onRemove: (index: number) => void;
  dataCy?: string;
}

export function ImagePreviewGrid({ images, onRemove, dataCy }: ImagePreviewGridProps) {
  if (images.length === 0) return null;

  return (
    <div data-cy={dataCy} className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-surface-900">이미지 첨부</p>
          <p className="mt-1 text-sm text-surface-500">
            장면을 먼저 보여주고, 짧은 문장으로 맥락을 더해 주세요.
          </p>
        </div>
        <span className="rounded-full border border-surface-200 bg-white px-3 py-1 text-xs font-semibold text-surface-500">
          {images.length}장
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((url, i) => (
          <div
            key={i}
            className={`relative overflow-hidden rounded-[24px] border border-surface-200 bg-surface-100 ${
              i === 0 && images.length > 2 ? 'aspect-[16/11] sm:col-span-2' : 'aspect-square'
            }`}
          >
            <Image
              src={url}
              alt=""
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover"
            />
            <button
              type="button"
              onClick={() => onRemove(i)}
              aria-label={`이미지 ${i + 1} 삭제`}
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/55 text-white transition-colors hover:bg-black/75"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
