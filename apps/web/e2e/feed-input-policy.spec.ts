import { expect, test } from '@playwright/test';
import {
  FEED_INPUT_LIMITS,
  canSubmitFeed,
  getFeedContentError,
  getFeedImageCountError,
  getFeedLinkUrlError,
  isAbsoluteHttpUrl,
  normalizeFeedLinkUrl,
} from '../src/entities/feed';

test.describe('피드 입력 정책', () => {
  test('본문 경계값과 게시 가능 상태를 판정한다', () => {
    const boundaryContent = '가'.repeat(FEED_INPUT_LIMITS.contentLength);

    expect(getFeedContentError(boundaryContent)).toBeNull();
    expect(getFeedContentError(`${boundaryContent}나`)).not.toBeNull();
    expect(canSubmitFeed({ content: boundaryContent, imageCount: 0, linkUrl: '' })).toBe(true);
    expect(canSubmitFeed({ content: '', imageCount: 0, linkUrl: '' })).toBe(false);
  });

  test('링크는 공백을 제거한 absolute http 또는 https 주소만 허용한다', () => {
    expect(normalizeFeedLinkUrl('  https://kscold.com/feed  ')).toBe(
      'https://kscold.com/feed'
    );
    expect(isAbsoluteHttpUrl('https://kscold.com/feed')).toBe(true);
    expect(isAbsoluteHttpUrl('https://kscold.com:443/feed')).toBe(true);
    expect(getFeedLinkUrlError('httpx://kscold.com/feed')).not.toBeNull();
    expect(getFeedLinkUrlError('/feed')).not.toBeNull();
    expect(getFeedLinkUrlError('ftp://kscold.com/feed')).not.toBeNull();
    expect(getFeedLinkUrlError('http://localhost/feed')).not.toBeNull();
    expect(getFeedLinkUrlError('http://service.internal/feed')).not.toBeNull();
    expect(getFeedLinkUrlError('https://user:password@kscold.com/feed')).not.toBeNull();
    expect(getFeedLinkUrlError('https://kscold.com:8443/feed')).not.toBeNull();
    expect(getFeedLinkUrlError('http://127.0.0.1/feed')).not.toBeNull();
    expect(getFeedLinkUrlError('http://[::1]/feed')).not.toBeNull();
    expect(getFeedLinkUrlError('')).toBeNull();
  });

  test('링크 길이와 이미지 합계 경계값을 판정한다', () => {
    const linkPrefix = 'https://kscold.com/';
    const boundaryLink = `${linkPrefix}${'a'.repeat(
      FEED_INPUT_LIMITS.linkUrlLength - linkPrefix.length
    )}`;

    expect(getFeedLinkUrlError(boundaryLink)).toBeNull();
    expect(getFeedLinkUrlError(`${boundaryLink}a`)).not.toBeNull();
    expect(getFeedImageCountError(FEED_INPUT_LIMITS.imageCount)).toBeNull();
    expect(getFeedImageCountError(3, 1)).toBeNull();
    expect(getFeedImageCountError(3, 2)).not.toBeNull();
  });
});
