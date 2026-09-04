'use client';

import Image from 'next/image';
import { useState } from 'react';
import { getLinkPreviewImageMode } from '@/shared/lib/link-preview-image';
import { LinkPreview } from '@/shared/model/types/social';

interface LinkPreviewCardProps {
  preview: LinkPreview;
}

export function LinkPreviewCard({ preview }: LinkPreviewCardProps) {
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);
  const imageUrl = preview.image;
  const imageMode = imageUrl ? getLinkPreviewImageMode(imageUrl) : 'hidden';
  const showImage = Boolean(imageUrl) && imageMode !== 'hidden' && failedImageUrl !== imageUrl;

  if (!preview.title && !preview.description && !preview.image) {
    return null;
  }

  return (
    <a
      href={preview.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block border border-surface-200 rounded-xl overflow-hidden hover:border-surface-300 transition-colors group"
    >
      {showImage && imageUrl && (
        <div className="relative h-40 overflow-hidden bg-surface-100">
          {imageMode === 'optimized' ? (
            <Image
              src={imageUrl}
              alt=""
              fill
              sizes="(max-width: 640px) calc(100vw - 68px), 568px"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              onError={() => setFailedImageUrl(imageUrl)}
            />
          ) : (
            <>
              {/* 임의 호스트는 서버 이미지 프록시를 거치지 않아 요청 범위를 제한한다. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt=""
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                onError={() => setFailedImageUrl(imageUrl)}
              />
            </>
          )}
        </div>
      )}
      <div className="p-3">
        {preview.siteName && (
          <p className="text-xs text-surface-600 font-medium uppercase tracking-wider mb-1">
            {preview.siteName}
          </p>
        )}
        {preview.title && (
          <p className="text-sm font-bold text-surface-900 line-clamp-2 mb-1">{preview.title}</p>
        )}
        {preview.description && (
          <p className="text-xs text-surface-500 line-clamp-2">{preview.description}</p>
        )}
      </div>
    </a>
  );
}
