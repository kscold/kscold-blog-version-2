import { test, expect, type Page, type APIRequestContext } from '@playwright/test';
import { isolateBackendApi, mockShellApis } from './support/api';
import { isPublicationStub, PUBLIC_CATEGORY, seedPublication } from './support/postPublication';

test.skip(!isPublicationStub, '가짜 글을 쓰는 로컬 스텁에서만 실행합니다.');

const CONTENT = [
  '# 모바일에서 길게 이어지는 제목도 자연스럽게 읽습니다', '',
  '본문은 단어 단위로 줄을 바꿉니다. 긴 주소도 문서 전체를 옆으로 밀어내면 안 됩니다.', '',
  `https://example.invalid/${'LongPathWithoutWhitespace'.repeat(8)}`, '',
  '> 인용문도 휴대폰에서 적절한 여백을 두고 읽을 수 있어야 합니다.', '',
  '| 구분 | 상태 |', '| --- | --- |', '| 웹 | 정상 |', '| 앱 | 준비 중 |', '',
  '| 개발 환경 버전 | 배포 환경 버전 | 데이터베이스 구성 | 요청 처리 방식 | 인증 정책 기준 | 장애 복구 순서 |',
  '| --- | --- | --- | --- | --- | --- |', '| 개발 | 운영 | 저장 | 처리 | 인증 | 복구 |', '',
  '```js', `const longLine = "${'connectionString'.repeat(10)}";`, '```', '',
  '```', '첫 줄은 그대로 둡니다.', '    둘째 줄은 네 칸 들여씁니다.', '```', '',
  '![묶음 첫째](/images/teams/pawpong-logo.png) ![묶음 둘째](/images/teams/pawpong-logo.png)',
].join('\n');

async function openArticle({ page, request }: { page: Page; request: APIRequestContext }) {
  await isolateBackendApi(page);
  await mockShellApis(page);
  const post = await seedPublication(request, {
    categoryId: PUBLIC_CATEGORY, status: 'PUBLISHED', content: CONTENT,
    title: '여러 종류의 본문을 모바일에서 읽기',
  });
  await page.goto(`/blog/${post.category.slug}/${post.slug}`);
}

test('작은 표는 화면에 맞고 넓은 표만 표 안에서 키보드로 스크롤한다', async ({ page, request }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openArticle({ page, request });
  const tables = page.getByRole('region', { name: '본문 표' });
  await expect(tables).toHaveCount(2);
  expect(await tables.first().evaluate(element => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(1);
  const wide = tables.nth(1);
  expect(await wide.evaluate(element => element.scrollWidth - element.clientWidth)).toBeGreaterThan(100);
  await wide.focus();
  await page.keyboard.press('ArrowRight');
  await expect.poll(() => wide.evaluate(element => element.scrollLeft)).toBeGreaterThan(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
});

test('코드 안의 들여쓰기를 유지하고 터치로 복사 결과와 실패를 확인할 수 있다', async ({ page, request }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: {
      writeText: async (text: string) => { Object.defineProperty(window, '__copiedCode', { value: text, configurable: true }); },
    } });
  });
  await openArticle({ page, request });
  const code = page.getByRole('region', { name: '코드 블록' });
  await expect(code.first()).toContainText('const longLine');
  expect(await code.first().evaluate(element => element.scrollWidth - element.clientWidth)).toBeGreaterThan(100);
  const expected = '첫 줄은 그대로 둡니다.\n    둘째 줄은 네 칸 들여씁니다.';
  await expect(code.nth(1).locator('code')).toHaveText(expected);
  const copy = page.getByRole('button', { name: '코드 복사' }).nth(1);
  await copy.scrollIntoViewIfNeeded();
  await expect(copy).toBeVisible();
  expect((await copy.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  await copy.click();
  await expect(copy).toHaveText('복사됨');
  expect(await page.evaluate(() => (window as unknown as { __copiedCode: string }).__copiedCode)).toBe(expected);
  await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: {
    writeText: async () => { throw new Error('시험용 복사 거부'); },
  } }));
  await copy.click();
  await expect(copy).toHaveText('복사 실패');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
});

test('모바일의 본문 제목·긴 주소가 넘치지 않고 이미지 묶음은 한 장씩 보여 준다', async ({ page, request }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openArticle({ page, request });
  const headingSize = await page.locator('.markdown-source-h1').evaluate(element => parseFloat(getComputedStyle(element).fontSize));
  expect(headingSize).toBeLessThanOrEqual(32);
  const pictures = page.getByRole('button', { name: /^이미지 크게 보기: 묶음/ });
  await pictures.first().scrollIntoViewIfNeeded();
  const first = (await pictures.first().boundingBox())!;
  const second = (await pictures.nth(1).boundingBox())!;
  expect(first.width).toBeGreaterThan(340);
  expect(second.y).toBeGreaterThanOrEqual(first.y + first.height);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
});

test('데스크톱의 이미지 묶음은 기존처럼 나란히 보여 준다', async ({ page, request }) => {
  await openArticle({ page, request });
  const pictures = page.getByRole('button', { name: /^이미지 크게 보기: 묶음/ });
  const first = (await pictures.first().boundingBox())!;
  const second = (await pictures.nth(1).boundingBox())!;
  expect(second.x).toBeGreaterThanOrEqual(first.x + first.width);
  expect(Math.abs(second.y - first.y)).toBeLessThanOrEqual(1);
});
