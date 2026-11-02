import { expect, test } from '@playwright/test';

const LIGHTBOX_POST = '/blog/engineering/ci-image-lightbox';

test('본문 이미지를 누르면 화면 전체에 원본으로 띄우고, 다시 누르면 원본 크기로 본다', async ({ page }) => {
  // CI 가짜 API의 이미지 글을 쓴다.
  await page.goto(LIGHTBOX_POST);
  const trigger = page.getByRole('button', { name: '이미지 크게 보기: CI 확대 그림' });
  await expect(trigger).toBeVisible();

  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'CI 확대 그림' });
  await expect(dialog).toBeVisible();
  // 크게 볼 때는 변환본이 아니라 원본 주소를 띄운다.
  const image = dialog.getByRole('img', { name: 'CI 확대 그림' });
  await expect(image).toHaveAttribute('src', '/images/teams/pawpong-logo.png');
  await expect(image).toHaveAttribute('data-zoom', 'fit');
  await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');
  await expect(dialog.getByRole('button', { name: '닫기' })).toBeFocused();

  await image.click();
  await expect(image).toHaveAttribute('data-zoom', 'actual');
  await image.click();
  await expect(image).toHaveAttribute('data-zoom', 'fit');

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
});

test('크게 본 이미지는 닫기 버튼이나 바깥을 눌러 닫고, 묶음 이미지도 크게 볼 수 있다', async ({ page }) => {
  await page.goto(LIGHTBOX_POST);
  await page.getByRole('button', { name: '이미지 크게 보기: CI 확대 그림' }).click();
  const dialog = page.getByRole('dialog', { name: 'CI 확대 그림' });
  await dialog.getByRole('button', { name: '닫기' }).click();
  await expect(dialog).toBeHidden();

  await page.getByRole('button', { name: '이미지 크게 보기: CI 묶음 둘째' }).click();
  const grouped = page.getByRole('dialog', { name: 'CI 묶음 둘째' });
  await expect(grouped).toBeVisible();
  // 이미지 바깥(어두운 배경)을 누르면 닫힌다.
  await grouped.click({ position: { x: 8, y: 300 } });
  await expect(grouped).toBeHidden();
  await expect(page.locator('[data-image-lightbox]')).toHaveCount(0);
});
