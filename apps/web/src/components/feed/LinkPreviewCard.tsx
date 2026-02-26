'use client';

import { LinkPreview } from '@/types/api';

interface LinkPreviewCardProps {
  preview: LinkPreview;
}

export function LinkPreviewCard({ preview }: LinkPreviewCardProps) {
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
      {preview.image && (
        <div className="relative h-40 overflow-hidden bg-surface-100">
          <img
            src={preview.image}
            alt={preview.title || ''}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>
      )}
      <div className="p-3">
        {preview.siteName && (
          <p className="text-xs text-surface-400 font-medium uppercase tracking-wider mb-1">
            {preview.siteName}
          </p>
        )}
        {preview.title && (
          <h4 className="text-sm font-bold text-surface-900 line-clamp-2 mb-1">{preview.title}</h4>
        )}
        {preview.description && (
          <p className="text-xs text-surface-500 line-clamp-2">{preview.description}</p>
        )}
      </div>
    </a>
  );
}
