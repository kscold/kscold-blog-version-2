import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';
import { HANSALIM_DOWNLOADS } from '../src/widgets/lecture/model/hansalimDownloads';

test('공개 강의 파일은 목록과 일치하고 모든 크기와 지문이 정확하다', () => {
  const directory = 'public/hansalim/files';
  expect(readdirSync(directory).sort()).toEqual(HANSALIM_DOWNLOADS.map(file => file.file).sort());
  for (const file of HANSALIM_DOWNLOADS) {
    const content = readFileSync(join(directory, file.file));
    expect(content.length, file.file).toBe(file.bytes);
    expect(createHash('sha256').update(content).digest('hex'), file.file).toBe(file.sha256);
  }
});

test('글꼴은 실습 ZIP으로 안내하고 별도 글꼴 카드·버튼은 보여 주지 않는다', async ({ page }) => {
  const font = HANSALIM_DOWNLOADS.find(item => item.key === 'font');
  expect(font?.hidden).toBe(true);

  await page.goto('/hansalim');
  const article = page.locator('article[data-release-id]');
  await expect(page.getByTestId('lecture-download-font')).toHaveCount(0);
  await expect(article.locator(`a[download="${font?.file}"]`)).toHaveCount(0);
  await expect(article.getByRole('link', { name: /글꼴/ })).toHaveCount(0);
  // PPT 행에는 글꼴 안내 상자를 두지 않고, 아래 접힌 도움말에서만 설치 방법을 보여 준다.
  await expect(page.getByTestId('lecture-download-pptx')).not.toContainText('글꼴');

  const help = page.getByTestId('lecture-font-help');
  await expect(help.getByText('서체 관리자', { exact: false })).toBeHidden();
  await help.getByText('PPT 글꼴이 다르게 보일 때').click();
  await expect(help).toContainText('실습 폴더의 글꼴 폴더에 Noto Sans KR이 들어 있습니다.');
  await expect(help).toContainText('PDF와 웹 슬라이드에는 설치가 필요하지 않습니다.');
  await expect(help.getByText('서체 관리자', { exact: false })).toBeVisible();
  // ZIP에 들어 있는 것과 PC에 설치된 것은 다르다. 압축만 풀면 설치된다고 읽히면 안 된다.
  await expect(help).toContainText('압축을 푸는 것만으로는 PC에 설치되지 않습니다.');
  await expect(article).not.toContainText('설치가 전혀 필요');
});
