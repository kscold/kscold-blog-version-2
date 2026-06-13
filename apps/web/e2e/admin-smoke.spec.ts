import { test, expect } from '@playwright/test';
import { success, mockApi, mockShellApis } from './support/api';
import { seedAdminSession } from './support/auth';

const SHOT_DIR = 'test-results/screenshots';

const postPage = {
  content: [
    {
      id: 'post-1',
      title: 'QA 화면 실험 로그',
      slug: 'qa-screen-log',
      category: { id: 'cat-1', name: 'Dev Story', slug: 'dev-story' },
      status: 'PUBLISHED',
      views: 98,
      featured: true,
      createdAt: '2026-04-03T08:00:00Z',
    },
  ],
  totalElements: 6,
  totalPages: 1,
  size: 20,
  number: 0,
  first: true,
  last: true,
  empty: false,
};

const vaultPage = {
  content: [
    {
      id: 'vault-1',
      title: 'Admin QA Session Notes',
      slug: 'admin-qa-session-notes',
      tags: ['qa', 'admin'],
      views: 120,
      commentsCount: 1,
      createdAt: '2026-04-02T17:00:00Z',
    },
  ],
  totalElements: 14,
  totalPages: 1,
  size: 50,
  number: 0,
  first: true,
  last: true,
  empty: false,
};

const chatRooms = [
  {
    userId: 'room-1',
    username: 'visitor-alpha',
    online: true,
    lastMessage: '테스트 실행이 보이네요.',
    lastTimestamp: '2026-04-03T08:15:00Z',
    unreadCount: 1,
    messageCount: 3,
    messages: [
      { id: 'msg-1', content: '테스트 실행이 보이네요.', sender: 'VISITOR', sentAt: '2026-04-03T08:15:00Z' },
    ],
  },
];

test.describe('어드민 라이브 스모크', () => {
  test('대시보드와 주요 페이지가 순차적으로 표시된다', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });

    await mockShellApis(page);
    await mockApi(
      page,
      'GET',
      '**/api/categories',
      success([
        {
          id: 'cat-1',
          name: 'Dev Story',
          slug: 'dev-story',
          description: '개발 경험과 회고',
          parent: null,
          icon: '✦',
          color: '#111827',
          order: 0,
          depth: 0,
          postCount: 12,
        },
      ])
    );
    await mockApi(
      page,
      'GET',
      '**/api/tags',
      success([
        { id: 'tag-1', name: 'Next.js', slug: 'next-js', postCount: 7, createdAt: '2026-03-20T12:00:00Z' },
        { id: 'tag-2', name: 'Spring Boot', slug: 'spring-boot', postCount: 4, createdAt: '2026-03-18T12:00:00Z' },
      ])
    );
    await mockApi(page, 'GET', '**/api/posts/admin*', success(postPage));
    await mockApi(page, 'GET', /\/api\/feeds(\?|$)/, success({ ...postPage, size: 1 }));
    await mockApi(page, 'GET', '**/api/feeds/admin*', success({ ...postPage, size: 20 }));
    await mockApi(page, 'GET', '**/api/vault/notes*', success(vaultPage));
    await mockApi(page, 'GET', '**/api/admin/chat/rooms', success(chatRooms));
    await mockApi(page, 'GET', '**/api/admin/users/stats', {
      totalUsers: 124,
      newUsersToday: 3,
      newUsersThisWeek: 11,
      newUsersThisMonth: 24,
      dailySignups: [
        { date: '04/01', count: 2 },
        { date: '04/02', count: 2 },
        { date: '04/03', count: 3 },
      ],
      recentUsers: [
        {
          id: 'user-1',
          username: 'kscold',
          displayName: '김승찬',
          email: 'developerkscold@gmail.com',
          avatar: null,
          role: 'ADMIN',
          createdAt: '오늘',
        },
      ],
    });
    await mockApi(
      page,
      'GET',
      '**/api/admin/access-requests',
      success([
        {
          id: 'req-1',
          userId: 'user-2',
          username: 'reader-one',
          categoryId: 'cat-1',
          categoryName: 'Dev Story',
          status: 'PENDING',
          message: '접근 권한을 확인하고 싶습니다.',
          createdAt: '2026-04-03T08:20:00Z',
        },
      ])
    );

    await seedAdminSession(page);

    await page.goto('/admin');
    await expect(page.getByText('Dashboard').first()).toBeVisible();
    await page.screenshot({ path: `${SHOT_DIR}/01-dashboard.png` });

    await page.goto('/admin/posts');
    await expect(page.getByText('포스트 관리')).toBeVisible();
    await page.screenshot({ path: `${SHOT_DIR}/02-posts.png` });

    await page.goto('/admin/categories');
    await expect(page.getByText('카테고리').first()).toBeVisible();
    await page.screenshot({ path: `${SHOT_DIR}/03-categories.png` });

    await page.goto('/admin/chat');
    await expect(page.getByText('방문자 채팅')).toBeVisible();
    await page.screenshot({ path: `${SHOT_DIR}/04-chat.png` });

    await page.goto('/admin/testing');
    await expect(page.getByText('QA / E2E')).toBeVisible();
    await page.screenshot({ path: `${SHOT_DIR}/05-testing.png` });

    await page.goto('/admin/access-requests');
    await expect(page).toHaveURL(/\/admin\/access-requests/);
    await expect(page.getByText('reader-one')).toBeVisible();
    await expect(page.getByText('승인').first()).toBeVisible();
    await page.screenshot({ path: `${SHOT_DIR}/06-access-requests.png` });
  });
});
