import { test, expect } from '@playwright/test';
import { absoluteUrl, toOgImage } from '../src/shared/lib/seo/metadata';

test.describe('SEO URL 정책', () => {
  test('canonical 경로는 운영 사이트 출처를 벗어나지 않는다', () => {
    expect(absoluteUrl('/blog')).toBe('https://kscold.com/blog');
    expect(absoluteUrl('//outside.example/path')).toBe(
      'https://kscold.com/outside.example/path'
    );
  });

  test('OG 이미지는 HTTPS 주소만 허용한다', () => {
    const fallback = 'https://kscold.com/apple-touch-icon.png';

    expect(toOgImage('/uploads/cover.webp')).toBe('https://kscold.com/uploads/cover.webp');
    expect(toOgImage('https://bucket.kscold.com/blog/cover.webp')).toBe(
      'https://bucket.kscold.com/blog/cover.webp'
    );
    expect(toOgImage('http://outside.example/cover.webp')).toBe(fallback);
    expect(toOgImage('data:image/svg+xml,test')).toBe(fallback);
    expect(toOgImage('javascript:alert(1)')).toBe(fallback);
  });
});
