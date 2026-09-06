import { test, expect } from '@playwright/test';
import sharp from 'sharp';
import { absoluteUrl, buildSocialImage, toOgImage } from '../src/shared/lib/seo/metadata';

test.describe('SEO URL 정책', () => {
  test('canonical 경로는 운영 사이트 출처를 벗어나지 않는다', () => {
    expect(absoluteUrl('/blog')).toBe('https://kscold.com/blog');
    expect(absoluteUrl('//outside.example/path')).toBe(
      'https://kscold.com/outside.example/path'
    );
  });

  test('OG 이미지는 HTTPS 주소만 허용한다', () => {
    const fallback = 'https://kscold.com/og-default.png';

    expect(toOgImage('/uploads/cover.webp')).toBe('https://kscold.com/uploads/cover.webp');
    expect(toOgImage('https://bucket.kscold.com/blog/cover.webp')).toBe(
      'https://bucket.kscold.com/blog/cover.webp'
    );
    expect(toOgImage('http://outside.example/cover.webp')).toBe(fallback);
    expect(toOgImage('data:image/svg+xml,test')).toBe(fallback);
    expect(toOgImage('javascript:alert(1)')).toBe(fallback);
  });

  test('기본 OG 이미지는 대형 공유 카드 규격과 구조화 속성을 제공한다', async () => {
    const image = buildSocialImage(undefined, '김승찬 블로그');
    const customImage = buildSocialImage('https://bucket.kscold.com/blog/cover.webp', '글');
    const metadata = await sharp('public/og-default.png').metadata();

    expect(image).toEqual({
      url: 'https://kscold.com/og-default.png',
      alt: 'KSCOLD 로고와 AI Agent, Backend, Full-stack 문구가 있는 김승찬 기술 블로그 공유 카드',
      width: 1200,
      height: 630,
      type: 'image/png',
    });
    expect(customImage).toEqual({
      url: 'https://bucket.kscold.com/blog/cover.webp',
      alt: '글',
    });
    expect({ format: metadata.format, width: metadata.width, height: metadata.height }).toEqual({
      format: 'png',
      width: 1200,
      height: 630,
    });
  });
});
