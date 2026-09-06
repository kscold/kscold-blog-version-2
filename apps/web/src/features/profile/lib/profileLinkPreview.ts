import { FEED_INPUT_LIMITS, isAbsoluteHttpUrl } from '@/entities/feed';
import { getLinkPreviewImageMode } from '@/shared/lib/link-preview-image';
import type { LinkPreview } from '@/shared/model/types/social';

const LINK_PREVIEW_TITLE_LENGTH = 120;
const LINK_PREVIEW_DESCRIPTION_LENGTH = 160;
const LINK_PREVIEW_SITE_NAME_LENGTH = 80;

function limitPreviewText(value: string | undefined, maxLength: number) {
  const text = value?.trim();
  if (!text) return undefined;
  const characters = Array.from(text);
  return characters.length <= maxLength
    ? text
    : `${characters.slice(0, maxLength - 3).join('').trimEnd()}...`;
}

function normalizePublicPreviewUrl(value?: string) {
  if (typeof value !== 'string') return undefined;
  const url = value.trim();
  return url.length <= FEED_INPUT_LIMITS.linkUrlLength && isAbsoluteHttpUrl(url)
    ? url
    : undefined;
}

function getPublicPreviewImage(value?: string) {
  const image = normalizePublicPreviewUrl(value);
  if (!image) return undefined;
  const parsedImage = new URL(image);
  return parsedImage.protocol === 'https:' && !parsedImage.port && getLinkPreviewImageMode(image) !== 'hidden'
    ? image
    : undefined;
}

/** 프로필 목록에는 화면에 쓰는 링크 요약과 허용된 이미지만 전달한다. */
export function toProfileLinkPreview(preview?: LinkPreview): LinkPreview | undefined {
  if (!preview) return undefined;
  const url = normalizePublicPreviewUrl(preview.url);
  if (!url) return undefined;

  const title = limitPreviewText(preview.title, LINK_PREVIEW_TITLE_LENGTH);
  const description = limitPreviewText(preview.description, LINK_PREVIEW_DESCRIPTION_LENGTH);
  const image = getPublicPreviewImage(preview.image);

  if (!title && !description && !image) return undefined;

  return {
    url,
    title,
    description,
    image,
    siteName: limitPreviewText(preview.siteName, LINK_PREVIEW_SITE_NAME_LENGTH),
  };
}
