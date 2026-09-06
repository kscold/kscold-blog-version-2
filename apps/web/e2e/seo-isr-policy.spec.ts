import { expect, test } from '@playwright/test';
import { generateStaticParams as vaultStaticParams } from '../src/app/vault/[slug]/page';

test.describe('SEO ISR 정책', () => {
  test('Vault 공개 경로를 빌드 열거 없이 온디맨드 생성한다', () => {
    expect(vaultStaticParams()).toEqual([]);
  });
});
