/* eslint-disable @next/next/no-img-element */

const OPTIMIZED_WIDTHS = [640, 828, 1080, 1920] as const;
const DEFAULT_WIDTH = 1080;

interface MarkdownImageProps {
  src?: string;
  alt?: string;
  className: string;
  sizes: string;
  priority?: boolean;
}

function getOptimizableSource(src: string): string | null {
  if (src.startsWith('/images/') || src.startsWith('/uploads/')) {
    return src;
  }

  try {
    const url = new URL(src);
    if (url.protocol !== 'https:') {
      return null;
    }
    if (
      url.hostname === 'kscold.com' &&
      (url.pathname.startsWith('/images/') || url.pathname.startsWith('/uploads/'))
    ) {
      return `${url.pathname}${url.search}`;
    }
    if (url.hostname === 'bucket.kscold.com') {
      return url.toString();
    }
  } catch {
    return null;
  }
  return null;
}

function optimizerUrl(src: string, width: number): string {
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=75`;
}

/** 본문 이미지는 고정 비율을 강제하지 않고 브라우저가 화면 폭에 맞는 변환본을 선택하게 한다. */
export function MarkdownImage({ src, alt = '', className, sizes, priority = false }: MarkdownImageProps) {
  if (!src) {
    return null;
  }

  const optimizableSource = getOptimizableSource(src);
  const optimizedProps = optimizableSource
    ? {
        src: optimizerUrl(optimizableSource, DEFAULT_WIDTH),
        srcSet: OPTIMIZED_WIDTHS.map(
          width => `${optimizerUrl(optimizableSource, width)} ${width}w`
        ).join(', '),
      }
    : { src, srcSet: undefined };

  // next/image는 원본 크기를 모르는 Markdown 이미지에 고정 비율을 요구하므로 native srcset을 사용한다.
  return (
    <img
      {...optimizedProps}
      alt={alt}
      className={className}
      sizes={optimizableSource ? sizes : undefined}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      decoding="async"
    />
  );
}
