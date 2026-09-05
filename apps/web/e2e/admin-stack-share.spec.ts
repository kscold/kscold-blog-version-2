import { expect, test } from '@playwright/test';
import { mockApi, mockShellApis, success } from './support/api';
import { seedAdminSession } from './support/auth';

const participants = [
  {
    id: 'participant-1',
    name: '민수',
    phoneNumber: '01011112222',
    email: '',
    userId: '',
  },
  {
    id: 'participant-2',
    name: '지연',
    phoneNumber: '01033334444',
    email: '',
    userId: '',
  },
];

const account = {
  bankName: '토스뱅크',
  accountNumber: '100012345678',
  accountHolder: '김승찬',
  contactPhone: '01055556666',
  displayText: '토스뱅크 1000-1234-5678 (김승찬)',
  contactText: '010-5555-6666',
  configured: true,
};

async function mockStackShareApis(page: Parameters<typeof mockShellApis>[0]) {
  await mockShellApis(page);
  await mockApi(page, 'GET', '**/api/admin/stack-share/account', success(account));
  await mockApi(page, 'GET', '**/api/admin/stack-share/participants', success(participants));
  await mockApi(
    page,
    'GET',
    '**/api/admin/stack-share/groups',
    success([
      {
        id: 'group-1',
        name: 'AI 도구 모임',
        defaultToolName: 'Claude Team',
        includeOwner: true,
        participantIds: participants.map(participant => participant.id),
      },
    ])
  );
  await mockApi(page, 'GET', '**/api/admin/stack-share/settlements', success([]));
  await mockApi(page, 'GET', '**/api/admin/notification-templates', success([]));
}

test.describe('공동 구독 정산 작성기', () => {
  test('저장 그룹을 채워 동일한 분담액과 발송 요청을 만든다', async ({ page }) => {
    await mockStackShareApis(page);
    await mockApi(
      page,
      'POST',
      '**/api/admin/stack-share/settlements/send',
      success({ groupId: 'settlement-1', requestedCount: 2, acceptedCount: 2 })
    );
    await seedAdminSession(page);
    await page.goto('/admin/stack-share');

    const composer = page.locator('section').filter({
      has: page.getByRole('heading', { name: '이번 정산 만들기' }),
    });
    await composer.getByRole('button', { name: /AI 도구 모임/ }).click();
    await composer.locator('input[inputmode="numeric"]').fill('10000');

    await expect(composer.getByPlaceholder('예: Claude Team')).toHaveValue('Claude Team');
    await expect(composer.getByText('3명으로 나눔')).toBeVisible();
    await expect(composer.getByText('3,334원')).toBeVisible();
    await expect(composer.getByText('3,333원')).toHaveCount(2);

    const requestPromise = page.waitForRequest(
      request =>
        request.method() === 'POST' &&
        request.url().includes('/api/admin/stack-share/settlements/send')
    );
    page.once('dialog', dialog => dialog.accept());
    await composer.getByRole('button', { name: '2명에게 정산 요청 보내기' }).click();

    const payload = (await requestPromise).postDataJSON();
    expect(payload).toMatchObject({
      toolName: 'Claude Team',
      billingPeriod: '이번 달',
      totalAmount: 10000,
      includeOwner: true,
      recipients: [
        { name: '민수', phoneNumber: '010-1111-2222', email: '' },
        { name: '지연', phoneNumber: '010-3333-4444', email: '' },
      ],
    });
    await expect(page.getByText('2명의 발송 요청을 접수했습니다.')).toBeVisible();
  });
});
