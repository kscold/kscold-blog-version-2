import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3101';

/**
 * Cypress → Playwright 전환 설정.
 * - 기존 Cypress 의 viewport(1440x960)·defaultCommandTimeout(10s) 를 계승
 * - e2e: 목(route) 기반 스펙, live: 실제 백엔드 대상 스모크
 */
export default defineConfig({
  testDir: './e2e',
  testMatch: ['**/*.spec.ts'],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  timeout: 30_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL,
    viewport: { width: 1440, height: 960 },
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
    screenshot: 'only-on-failure',
    video: 'off',
    trace: 'on-first-retry',
    // framer-motion 진입 애니메이션 중 요소가 detach/remount 되어 클릭이 불안정해지는 것을
    // 막는다. 사이트의 reduced-motion 게이트가 작동해 모션을 끄므로 DOM 이 안정된다.
    reducedMotion: 'reduce',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 960 } },
    },
  ],
});
