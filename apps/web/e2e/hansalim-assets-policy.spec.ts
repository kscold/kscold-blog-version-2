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

test('글꼴 설치를 다운로드의 필수 조건이 아닌 PPT 이용자용 선택 사항으로 안내한다', async ({ page }) => {
  await page.goto('/hansalim');
  const font = page.getByTestId('lecture-download-font');
  await expect(font.getByRole('heading')).toContainText('선택');
  await expect(font).toContainText('PDF·웹 슬라이드·실습 자료에는 필요 없습니다.');
  await expect(page.getByTestId('lecture-download-pptx')).toContainText(
    '자료를 내려받는 데 글꼴 설치는 필요 없습니다.'
  );
  await expect(font.getByRole('link', { name: /ZIP 내려받기/ })).toHaveAttribute(
    'download', '글꼴_NotoSansKR.zip'
  );
});
