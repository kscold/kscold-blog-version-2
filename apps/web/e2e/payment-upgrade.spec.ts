import { expect, test, type Page } from '@playwright/test';
import { isolateBackendApi, mockApi, mockShellApis, success } from './support/api';
import { createVerifiedAdminAccessToken, seedAdminSession } from './support/auth';

const paymentConfig = {
  configured: true, livePayment: true, storeId: 'store-e2e', channelKey: 'channel-e2e',
  productName: '검증용 상품', orderName: '검증용 주문', totalAmount: 1000,
  currency: 'KRW', servicePeriod: '검증 전용',
};

for (const scenario of [
  { name: '참가권', path: '/kakaopay/payment-path', api: '/api/payments/ai-agent-bloom' },
  { name: '관리자', path: '/admin/kakaopay-live-test', api: '/api/payments/ai-agent-bloom/live-test' },
]) {
  async function prepare(page: Page) {
    await isolateBackendApi(page);
    await mockShellApis(page);
    await seedAdminSession(page);
    await page.context().addCookies([{
      name: 'auth-token', value: createVerifiedAdminAccessToken(),
      url: process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3101',
    }]);
    await mockApi(page, 'GET', `**${scenario.api}/config`, success(paymentConfig));
    // SDK의 외부 결제 창은 열지 않고 브라우저 어댑터에 준비한 응답만 돌려준다.
    await page.route(/https:\/\/(?:cdn\.portone\.io|service\.portone\.io)\//, route => route.abort());
  }

  test(`${scenario.name} 결제 확인 뒤 주소 문구가 바뀌어도 다시 대기하지 않는다`, async ({ page }) => {
    await prepare(page);
    let completions = 0;
    await page.route(`**${scenario.api}/complete`, async route => {
      completions += 1;
      expect(route.request().postDataJSON().paymentId).toBe('payment-e2e');
      await route.fulfill({ json: success({ paymentId: 'payment-e2e', status: 'PAID', message: '검증 승인 완료' }) });
    });
    await page.goto(`${scenario.path}?paymentId=payment-e2e`);
    await expect(page.getByText('검증 승인 완료', { exact: false })).toBeVisible();
    await expect(page.getByRole('button', { name: /카카오페이.*결제하기/ })).toBeEnabled();
    await page.evaluate(() => {
      const url = new URL(location.href);
      url.searchParams.set('message', '완료 안내');
      history.pushState(null, '', url);
    });
    await expect(page).toHaveURL(/message=/);
    await expect(page.getByText('검증 승인 완료', { exact: false })).toBeVisible();
    await expect(page.getByRole('button', { name: /카카오페이.*결제하기/ })).toBeEnabled();
    expect(completions).toBe(1);
  });

  test(`${scenario.name} 모의 SDK 결제 요청과 승인 응답을 전달한다`, async ({ page }) => {
    await prepare(page);
    await page.addInitScript(() => {
      Object.assign(window, {
        PortOne: { requestPayment: async (request: unknown) => {
          sessionStorage.setItem('e2e-payment-request', JSON.stringify(request));
          return { paymentId: 'payment-e2e' };
        } },
      });
    });
    await mockApi(page, 'POST', `**${scenario.api}/prepare`, success({
      ...paymentConfig, paymentId: 'payment-e2e', programKey: 'e2e',
      customerName: '검증 사용자', customerEmail: 'test@example.com', customerPhone: '010-1234-5678',
    }));
    let completions = 0;
    await page.route(`**${scenario.api}/complete`, async route => {
      completions += 1;
      await route.fulfill({ json: success({ paymentId: 'payment-e2e', status: 'PAID', message: '검증 승인 완료' }) });
    });
    await page.goto(scenario.path);
    await page.getByLabel('주문자명', { exact: true }).fill('검증 사용자');
    await page.getByLabel('연락처', { exact: true }).fill('01012345678');
    await page.getByLabel('이메일', { exact: true }).fill('test@example.com');
    await page.getByRole('button', { name: /카카오페이.*결제하기/ }).click();
    await expect(page.getByText('검증 승인 완료', { exact: false })).toBeVisible();
    await expect(page.getByRole('button', { name: /카카오페이.*결제하기/ })).toBeEnabled();
    expect(completions).toBe(1);
    const request = await page.evaluate(() => JSON.parse(sessionStorage.getItem('e2e-payment-request') || 'null'));
    expect(request).toMatchObject({
      storeId: 'store-e2e', channelKey: 'channel-e2e', paymentId: 'payment-e2e',
      totalAmount: 1000, payMethod: 'EASY_PAY', easyPay: { easyPayProvider: 'KAKAOPAY' },
      customer: { phoneNumber: '01012345678' },
    });
  });
}
