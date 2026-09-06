'use client';

import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import Image from 'next/image';

const MotionImage = motion.create(Image);

interface ImageCarouselProps {
  images: string[];
  label: string;
  sizes: string;
}

export function ImageCarousel({ images, label, sizes }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const reduceMotion = useReducedMotion();

  if (images.length === 0) return null;

  if (images.length === 1) {
    return (
      <div className="relative aspect-square overflow-hidden bg-surface-100">
        <Image src={images[0]} alt={label} fill sizes={sizes} className="object-cover" />
      </div>
    );
  }

  const goTo = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  const goPrev = () => {
    if (currentIndex > 0) goTo(currentIndex - 1);
  };

  const goNext = () => {
    if (currentIndex < images.length - 1) goTo(currentIndex + 1);
  };

  const variants = {
    enter: (d: number) => ({ x: reduceMotion ? 0 : d > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: reduceMotion ? 0 : d > 0 ? -300 : 300, opacity: 0 }),
  };

  return (
    <div
      role="group"
      aria-roledescription="carousel"
      aria-label={label}
      className="relative aspect-square overflow-hidden bg-surface-100 group"
    >
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <MotionImage
          key={currentIndex}
          src={images[currentIndex]}
          alt={`${label} ${currentIndex + 1}`}
          fill
          sizes={sizes}
          className="object-cover"
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={reduceMotion ? { duration: 0 } : { duration: 0.3, ease: 'easeInOut' }}
        />
      </AnimatePresence>

      {currentIndex > 0 && (
        <button
          type="button"
          aria-label="이전 이미지 보기"
          onClick={goPrev}
          className="absolute left-2 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 shadow-sm backdrop-blur-sm transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-surface-900 sm:left-3"
        >
          <svg
            className="w-4 h-4 text-surface-900"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      )}

      {currentIndex < images.length - 1 && (
        <button
          type="button"
          aria-label="다음 이미지 보기"
          onClick={goNext}
          className="absolute right-2 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 shadow-sm backdrop-blur-sm transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-surface-900 sm:right-3"
        >
          <svg
            className="w-4 h-4 text-surface-900"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {images.length > 1 && (
        <div className="absolute bottom-2 left-1/2 z-20 flex -translate-x-1/2 gap-1 sm:bottom-3">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`${i + 1}번 이미지 보기`}
              aria-current={i === currentIndex ? 'true' : undefined}
              onClick={() => goTo(i)}
              className="flex h-6 w-6 items-center justify-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-white"
            >
              <span
                aria-hidden
                className={`h-1.5 rounded-full transition-all motion-reduce:transition-none ${
                  i === currentIndex ? 'w-3 bg-white' : 'w-1.5 bg-white/50'
                }`}
              />
            </button>
          ))}
        </div>
      )}

      {images.length > 1 && (
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="pointer-events-none absolute right-3 top-3 z-20 rounded-full bg-black/50 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm"
        >
          {currentIndex + 1} / {images.length}
        </div>
      )}
    </div>
  );
}
