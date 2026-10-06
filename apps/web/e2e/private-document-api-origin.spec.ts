import { expect, test } from '@playwright/test';
import { mockShellApis } from './support/api';
import { seedAdminSession } from './support/auth';
import { mockPrivateDocuments } from './support/adminDocuments';

test('비공개 문서 인증과 조회는 CSP를 완화하지 않고 같은 출처를 사용한다', async ({ page }) => {
  const apiOrigins = new Set<string>();
  const violations: string[] = [];
  await page.exposeFunction('recordDocumentCspViolation', (directive: string) => {
    violations.push(directive);
  });
  await page.addInitScript(() => {
    document.addEventListener('securitypolicyviolation', event => {
      if (event.effectiveDirective !== 'connect-src') return;
      const recorder = window as Window & {
        recordDocumentCspViolation: (directive: string) => Promise<void>;
      };
      void recorder.recordDocumentCspViolation(event.effectiveDirective);
    });
  });
  page.on('request', request => {
    const url = new URL(request.url());
    if (url.pathname === '/api/auth/me' || url.pathname.startsWith('/api/admin/documents')) {
      apiOrigins.add(url.origin);
    }
  });
  await mockShellApis(page);
  await seedAdminSession(page);
  await mockPrivateDocuments(page);
  const response = await page.goto('/admin/documents');
  await expect(page.locator('[data-testid="admin-documents-page"]')).toBeVisible();
  await expect(page.getByText('아직 보관한 문서가 없습니다.')).toBeVisible();
  expect(apiOrigins).toEqual(new Set([new URL(page.url()).origin]));
  const policy = response?.headers()['content-security-policy'] ?? '';
  expect(policy).toContain("connect-src 'self'");
  expect(policy).not.toContain('4100');
  expect(violations).toEqual([]);
});
