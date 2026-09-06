import { expect, test, type Page } from '@playwright/test';
import axe from 'axe-core';

const ACCESSIBILITY_RULES = ['color-contrast', 'link-name'];
const MOTION_SETTLE_MS = 1_600;

interface AxeViolation {
  id: string;
  nodes: Array<{ target: string[] }>;
}

interface AxeBrowserApi {
  run: (
    context: Document,
    options: { runOnly: { type: 'rule'; values: string[] } }
  ) => Promise<{ violations: AxeViolation[] }>;
}

function formatViolations(violations: AxeViolation[]) {
  return violations
    .map(violation => {
      const targets = violation.nodes.flatMap(node => node.target).join(', ');
      return `${violation.id}: ${targets}`;
    })
    .join('\n');
}

async function analyzeSettledPage(page: Page, pathname: string) {
  await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
  await page.goto(pathname, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(MOTION_SETTLE_MS);
  await page.addScriptTag({ content: axe.source });

  return page.evaluate(async rules => {
    const browserAxe = (window as unknown as { axe: AxeBrowserApi }).axe;
    return browserAxe.run(document, {
      runOnly: { type: 'rule', values: rules },
    });
  }, ACCESSIBILITY_RULES);
}

test.describe('공개 소개 페이지 접근성', () => {
  for (const pathname of ['/info/pawpong', '/profile/kscold']) {
    test(`${pathname}은 라이트 모드에서 텍스트 대비와 링크 이름을 충족한다`, async ({ page }) => {
      const result = await analyzeSettledPage(page, pathname);

      expect(result.violations, formatViolations(result.violations)).toEqual([]);
    });
  }
});
