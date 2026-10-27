import { expect, test } from '@playwright/test';
import { mockShellApis } from './support/api';

// CI에서도 실제 WebGL을 그리되 GPU 제조사 정보를 숨기는 브라우저 조건을 재현한다.
test.use({
  reducedMotion: 'no-preference',
  launchOptions: { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] },
});

test('입체 로고가 실제 픽셀을 그리고 페이지 이동 뒤에도 다시 표시된다', async ({ page }) => {
  await mockShellApis(page);
  await page.addInitScript(() => {
    for (const prototype of [WebGLRenderingContext.prototype, WebGL2RenderingContext.prototype]) {
      const original = prototype.getExtension;
      prototype.getExtension = function (name: string) {
        return name === 'WEBGL_debug_renderer_info' ? null : original.call(this, name);
      };
    }
  });
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  for (let visit = 0; visit < 2; visit += 1) {
    await page.goto('/');
    const canvas = page.getByTestId('hero-artwork').locator('canvas');
    await expect(canvas).toHaveCSS('opacity', '1', { timeout: 20_000 });
    const pixels = await canvas.evaluate((element: HTMLCanvasElement) => new Promise<number>(resolve => {
      requestAnimationFrame(() => {
        const context = element.getContext('webgl2');
        if (!context) return resolve(0);
        const data = new Uint8Array(element.width * element.height * 4);
        context.readPixels(0, 0, element.width, element.height, context.RGBA, context.UNSIGNED_BYTE, data);
        let visible = 0;
        for (let index = 3; index < data.length; index += 4) if (data[index] > 0) visible += 1;
        resolve(visible);
      });
    }));
    expect(pixels).toBeGreaterThan(100);
    await expect(page.getByTestId('hero-artwork').locator('.hero-logo-float')).toHaveCSS('opacity', '0');
    await page.getByTestId('hero-primary-cta').click();
    await expect(page).toHaveURL(/\/blog$/);
    await expect(page.getByTestId('hero-artwork')).toHaveCount(0);
  }
  expect(errors).toEqual([]);
});
