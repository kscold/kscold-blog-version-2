'use client';

/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MarkdownImage } from './MarkdownImage';

interface ZoomableMarkdownImageProps {
  src?: string;
  alt?: string;
  className: string;
  sizes: string;
  priority?: boolean;
}

/**
 * 본문 이미지를 누르면 화면 전체에 크게 띄운다.
 * 아키텍처 그림처럼 글씨가 작은 이미지는 크게 띄운 뒤 한 번 더 누르면 원본 크기로 보고 스크롤할 수 있다.
 */
export function ZoomableMarkdownImage({
  src,
  alt = '',
  className,
  sizes,
  priority = false,
}: ZoomableMarkdownImageProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isActualSize, setIsActualSize] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setIsOpen(false);
    setIsActualSize(false);
    triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    // 크게 보는 동안 뒤의 본문이 스크롤되지 않게 막고, 닫으면 원래대로 돌린다.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, close]);

  if (!src) {
    return null;
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label={alt ? `이미지 크게 보기: ${alt}` : '이미지 크게 보기'}
        className="group relative block w-full cursor-zoom-in border-0 bg-transparent p-0 text-left"
      >
        <MarkdownImage src={src} alt={alt} className={className} sizes={sizes} priority={priority} />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
        >
          크게 보기
        </span>
      </button>
      {isOpen &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={alt || '이미지 크게 보기'}
            data-image-lightbox
            onClick={close}
            className="fixed inset-0 z-[200] flex flex-col bg-black/90"
          >
            <div className="flex shrink-0 items-center justify-between gap-3 px-4 py-3 text-sm text-white/80">
              <span>{isActualSize ? '원본 크기 · 이미지를 누르면 화면에 맞춰요' : '이미지를 누르면 원본 크기로 볼 수 있어요'}</span>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={close}
                className="shrink-0 rounded-full bg-white/10 px-3 py-1.5 font-medium text-white transition hover:bg-white/20"
              >
                닫기
              </button>
            </div>
            <div
              className={`min-h-0 flex-1 overflow-auto px-4 pb-4 ${
                isActualSize ? '' : 'flex items-center justify-center'
              }`}
            >
              {/* 크게 볼 때는 변환본이 아닌 원본을 띄워 작은 글씨까지 선명하게 보이게 한다. */}
              <img
                src={src}
                alt={alt}
                data-zoom={isActualSize ? 'actual' : 'fit'}
                onClick={event => {
                  event.stopPropagation();
                  setIsActualSize(value => !value);
                }}
                className={
                  isActualSize
                    ? 'max-w-none cursor-zoom-out'
                    : 'max-h-[calc(100dvh-7.5rem)] max-w-full cursor-zoom-in object-contain'
                }
              />
            </div>
            {alt && <p className="shrink-0 px-4 pb-4 text-center text-sm text-white/80">{alt}</p>}
          </div>,
          document.body
        )}
    </>
  );
}
