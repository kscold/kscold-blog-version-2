'use client';

import Image from 'next/image';

interface ImagePreviewScrollProps {
  images: string[];
  onRemove: (index: number) => void;
}

export function ImagePreviewScroll({ images, onRemove }: ImagePreviewScrollProps) {
  if (images.length === 0) return null;

  return (
    <div className="px-4 pb-3">
      <div className="flex gap-2 overflow-x-auto">
        {images.map((url, i) => (
          <div key={i} className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-surface-100">
            <Image src={url} alt="" fill sizes="80px" className="object-cover" />
            <button
              onClick={() => onRemove(i)}
              className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70"
            >
              <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
