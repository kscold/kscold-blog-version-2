import { expect, test } from '@playwright/test';
import {
  isIndexableFeed,
  isIndexableFeedLength,
} from '../src/shared/lib/seo/indexability';

test.describe('SEO 콘텐츠 분량 정책', () => {
  test('피드 본문과 MongoDB 길이 투영이 Unicode 코드포인트 기준을 공유한다', () => {
    expect(isIndexableFeed('가'.repeat(500))).toBe(true);
    expect(isIndexableFeed('😀'.repeat(250))).toBe(false);
    expect(isIndexableFeedLength(500)).toBe(true);
    expect(isIndexableFeedLength(499)).toBe(false);
  });

  test('본문 바깥 공백은 피드 분량에 포함하지 않는다', () => {
    expect(isIndexableFeed(`  ${'가'.repeat(499)}  `)).toBe(false);
  });
});
