'use client';

import { useRef } from 'react';
import Image from 'next/image';

interface FeedImageUploaderProps {
  images: string[];
  isUploading: boolean;
  onUpload: (files: FileList) => void;
  onRemove: (index: number) => void;
}

export function FeedImageUploader({ images, isUploading, onUpload, onRemove }: FeedImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      {/* Images Preview */}
      {images.length > 0 && (
        <div className="p-4 border-b border-surface-100">
          <div className="grid grid-cols-3 gap-2">
            {images.map((url, i) => (
              <div
                key={i}
                className="relative aspect-square rounded-lg overflow-hidden bg-surface-100"
              >
                <Image src={url} alt="" fill sizes="33vw" className="object-cover" />
                <button
                  onClick={() => onRemove(i)}
                  className="absolute top-1 right-1 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70"
                >
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Button */}
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="flex items-center gap-1.5 text-sm text-surface-500 hover:text-surface-900 transition-colors"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v13.5A1.5 1.5 0 003.75 21z"
          />
        </svg>
        {isUploading ? '업로드 중...' : '사진'}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={e => e.target.files && onUpload(e.target.files)}
        className="hidden"
      />
    </>
  );
}
