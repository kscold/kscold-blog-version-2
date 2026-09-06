import { expect, test } from '@playwright/test';
import { generateStaticParams as categoryStaticParams } from '../src/app/blog/[category]/page';
import { generateStaticParams as tagStaticParams } from '../src/app/blog/tags/[slug]/page';
import { generateStaticParams as vaultStaticParams } from '../src/app/vault/[slug]/page';

test.describe('SEO ISR 정책', () => {
  test('공개 동적 경로를 빌드 열거 없이 온디맨드 생성한다', () => {
    expect(categoryStaticParams()).toEqual([]);
    expect(tagStaticParams()).toEqual([]);
    expect(vaultStaticParams()).toEqual([]);
  });
});
