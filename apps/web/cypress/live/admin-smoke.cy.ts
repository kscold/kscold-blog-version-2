function success<T>(data: T) {
  return {
    success: true,
    data,
    message: null,
    errorCode: null,
    timestamp: '2026-04-03T00:00:00',
  };
}

function base64UrlEncode(value: string) {
  const encoded = new TextEncoder().encode(value);
  const binary = Array.from(encoded, byte => String.fromCharCode(byte)).join('');
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function createAdminAccessToken() {
  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = base64UrlEncode(
    JSON.stringify({
      sub: 'admin-1',
      role: 'ADMIN',
      type: 'access',
      exp: Math.floor(Date.now() / 1000) + 60 * 60,
    })
  );

  return `${header}.${payload}.signature`;
}

function seedAdminSession() {
  const accessToken = createAdminAccessToken();
  const persistedAuth = JSON.stringify({
    state: {
      user: {
        id: 'admin-1',
        email: 'developerkscold@gmail.com',
        username: 'kscold',
        displayName: '김승찬',
        role: 'ADMIN',
      },
      token: accessToken,
    },
    version: 0,
  });

  cy.visit('/login');
  cy.setCookie('auth-token', accessToken);
  cy.window().then(win => {
    win.localStorage.setItem('accessToken', accessToken);
    win.localStorage.setItem('refreshToken', 'fake-refresh-token');
    win.localStorage.setItem('auth-storage', persistedAuth);
  });
}

function stubAdminApis() {
  const categories = [
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
  ];

  const tags = [
    { id: 'tag-1', name: 'Next.js', slug: 'next-js', postCount: 7, createdAt: '2026-03-20T12:00:00Z' },
    { id: 'tag-2', name: 'Spring Boot', slug: 'spring-boot', postCount: 4, createdAt: '2026-03-18T12:00:00Z' },
  ];

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

  const feedsPage = {
    content: [
      {
        id: 'feed-1',
        content: 'QA 세션 스트림 실험 중입니다.',
        images: [],
        visibility: 'PUBLIC',
        likesCount: 17,
        commentsCount: 2,
        createdAt: '2026-04-03T08:10:00Z',
      },
    ],
    totalElements: 3,
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
      messages: [{ id: 'msg-1', content: '테스트 실행이 보이네요.', sender: 'VISITOR', sentAt: '2026-04-03T08:15:00Z' }],
    },
  ];

  const userStats = {
    totalUsers: 124,
    newUsersToday: 3,
    newUsersThisWeek: 11,
    newUsersThisMonth: 24,
    dailySignups: [
      { date: '03/28', count: 2 },
      { date: '03/29', count: 3 },
      { date: '03/30', count: 1 },
      { date: '03/31', count: 4 },
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
  };

  const accessRequests = [
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
  ];

  cy.intercept('GET', '**/api/categories', { statusCode: 200, body: success(categories) }).as('categories');
  cy.intercept('GET', '**/api/tags', { statusCode: 200, body: success(tags) }).as('tags');
  cy.intercept('GET', '**/api/posts/admin*', { statusCode: 200, body: success(postPage) }).as('adminPosts');
  cy.intercept('GET', '**/api/feeds?page=0&size=1', { statusCode: 200, body: success({ ...feedsPage, size: 1 }) }).as('feedsSummary');
  cy.intercept('GET', '**/api/feeds/admin*', { statusCode: 200, body: success(feedsPage) }).as('adminFeeds');
  cy.intercept('GET', '**/api/vault/notes?page=0&size=1', { statusCode: 200, body: success({ ...vaultPage, size: 1 }) }).as('vaultSummary');
  cy.intercept('GET', '**/api/vault/notes?page=0&size=50', { statusCode: 200, body: success(vaultPage) }).as('adminVault');
  cy.intercept('GET', '**/api/admin/chat/rooms', { statusCode: 200, body: success(chatRooms) }).as('chatRooms');
  cy.intercept('GET', '**/api/admin/users/stats', { statusCode: 200, body: userStats }).as('userStats');
  cy.intercept('GET', '**/api/admin/access-requests', {
    statusCode: 200,
    body: success(accessRequests),
  }).as('accessRequests');
}

describe('live admin smoke observer', () => {
  before(() => {
    cy.viewport(1440, 900);
    stubAdminApis();
    seedAdminSession();
  });

  it('shows admin dashboard and key pages in sequence', () => {
    cy.visit('/admin');
    cy.wait(['@categories', '@tags', '@adminPosts', '@feedsSummary', '@vaultSummary', '@chatRooms', '@userStats']);
    cy.contains('Dashboard').should('be.visible');
    cy.screenshot('01-dashboard');

    cy.visit('/admin/posts');
    cy.wait('@adminPosts');
    cy.contains('포스트 관리').should('be.visible');
    cy.screenshot('02-posts');

    cy.visit('/admin/categories');
    cy.wait('@categories');
    cy.contains('카테고리').should('be.visible');
    cy.screenshot('03-categories');

    cy.visit('/admin/chat');
    cy.wait('@chatRooms');
    cy.contains('방문자 채팅').should('be.visible');
    cy.screenshot('04-chat');

    cy.visit('/admin/testing');
    cy.contains('QA / E2E').should('be.visible');
    cy.screenshot('05-testing');

    cy.visit('/admin/access-requests');
    cy.wait('@accessRequests');
    cy.url().should('include', '/admin/access-requests');
    cy.contains('reader-one').should('be.visible');
    cy.contains('승인').should('be.visible');
    cy.screenshot('06-access-requests');
  });
});
