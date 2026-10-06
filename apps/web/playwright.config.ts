import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3101';
const isCI = Boolean(process.env.CI);
const defaultWorkers = isCI ? 2 : 1;
const configuredWorkers = Number(process.env.PLAYWRIGHT_WORKERS || defaultWorkers);
const workers =
  Number.isInteger(configuredWorkers) && configuredWorkers > 0 ? configuredWorkers : defaultWorkers;

/**
 * 브라우저 E2E 설정.
 * - 기본 화면 크기는 1440x960, 동작 하나의 대기 한도는 10초
 * - 스펙은 API를 목(route)으로 채워 돌린다. 어드민 QA 러너는 PLAYWRIGHT_BASE_URL 을 운영 주소로 바꿔 같은 스펙을 실행한다.
 */
export default defineConfig({
  testDir: './e2e',
  testMatch: ['**/*.spec.ts'],
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  workers,
  reporter: isCI ? [['github'], ['list']] : 'list',
  timeout: isCI ? 60_000 : 30_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL,
    viewport: { width: 1440, height: 960 },
    actionTimeout: 10_000,
    navigationTimeout: isCI ? 30_000 : 15_000,
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
