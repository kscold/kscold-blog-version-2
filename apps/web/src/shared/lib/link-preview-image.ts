import imagePolicy from '@/shared/config/link-preview-images.json';

export type LinkPreviewImageMode = 'optimized' | 'external' | 'hidden';

/** 저장된 외부 이미지 중 신뢰 가능한 고정 CDN만 서버 이미지 변환을 허용한다. */
export function getLinkPreviewImageMode(imageUrl: string): LinkPreviewImageMode {
  try {
    const url = new URL(imageUrl);
    if (url.protocol !== 'https:') {
      return 'hidden';
    }

    const blocked = imagePolicy.blockedHostnameSuffixes.some(
      suffix => url.hostname === suffix || url.hostname.endsWith(`.${suffix}`)
    );
    if (blocked) {
      return 'hidden';
    }

    const optimized = imagePolicy.optimizedPatterns.some(pattern => {
      const pathnamePrefix = pattern.pathname.endsWith('**')
        ? pattern.pathname.slice(0, -2)
        : pattern.pathname;
      return (
        url.protocol === `${pattern.protocol}:` &&
        url.hostname === pattern.hostname &&
        url.pathname.startsWith(pathnamePrefix)
      );
    });
    return optimized ? 'optimized' : 'external';
  } catch {
    return 'hidden';
  }
}
