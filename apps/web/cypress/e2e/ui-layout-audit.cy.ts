/// <reference types="cypress" />

export {};

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  message?: string | null;
  errorCode?: string | null;
  timestamp: string;
};

function success<T>(data: T): ApiEnvelope<T> {
  return {
    success: true,
    data,
    message: null,
    errorCode: null,
    timestamp: '2026-04-08T00:00:00',
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

function stubShellApis() {
  cy.intercept('GET', '**/api/categories', {
    statusCode: 200,
    body: success([
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
    ]),
  }).as('categories');

  cy.intercept('GET', '**/api/tags', {
    statusCode: 200,
    body: success([]),
  }).as('tags');
}

function stubAdminApis() {
  const emptyPage = {
    content: [],
    totalElements: 0,
    totalPages: 0,
    size: 20,
    number: 0,
    first: true,
    last: true,
    empty: true,
  };

  cy.intercept('GET', '**/api/posts/admin*', {
    statusCode: 200,
    body: success(emptyPage),
  }).as('adminPosts');

  cy.intercept('GET', '**/api/feeds?page=0&size=1', {
    statusCode: 200,
    body: success({ ...emptyPage, size: 1 }),
  }).as('feedsSummary');

  cy.intercept('GET', '**/api/vault/notes?page=0&size=1', {
    statusCode: 200,
    body: success({ ...emptyPage, size: 1 }),
  }).as('vaultSummary');

  cy.intercept('GET', '**/api/admin/chat/rooms', {
    statusCode: 200,
    body: success([]),
  }).as('chatRooms');

  cy.intercept('GET', '**/api/admin/users/stats', {
    statusCode: 200,
    body: {
      totalUsers: 124,
      newUsersToday: 3,
      newUsersThisWeek: 11,
      newUsersThisMonth: 24,
      dailySignups: [],
      recentUsers: [],
    },
  }).as('userStats');

  cy.intercept('GET', '**/api/admin/access-requests', {
    statusCode: 200,
    body: success([
      {
        id: 'req-1',
        userId: 'user-2',
        username: 'reader-one',
        postId: 'post-1',
        postTitle: '권한 모델',
        postSlug: 'access-model',
        categoryId: 'cat-1',
        categoryName: 'Dev Story',
        status: 'PENDING',
        grantScope: 'POST',
        message: '접근 권한을 확인하고 싶습니다.',
        createdAt: '2026-04-08T08:20:00Z',
      },
    ]),
  }).as('accessRequests');
}

function stubGuestbookApi() {
  cy.intercept('GET', '**/api/guestbook?page=0&size=12', {
    statusCode: 200,
    body: success({
      content: [
        {
          id: 'entry-1',
          authorName: '기존 방문자',
          isAdmin: false,
          canDelete: false,
          content: '반가웠어요. 다음 글도 기대할게요.',
          createdAt: '2026-04-08T09:00:00Z',
        },
      ],
      totalElements: 1,
      totalPages: 1,
      size: 12,
      number: 0,
      first: true,
      last: true,
      empty: false,
    }),
  }).as('guestbook');
}

function expectNoHorizontalOverflow(width: number) {
  cy.window().then(win => {
    expect(win.document.documentElement.scrollWidth).to.be.lte(width);
  });
}

describe('UI 레이아웃 캡처 시나리오', () => {
  beforeEach(() => {
    stubShellApis();
    stubAdminApis();
    stubGuestbookApi();
  });

  it('시나리오: 모바일 해상도에서 주요 화면의 버튼과 문구가 자연스럽게 보인다', () => {
    cy.viewport(390, 844);
    seedAdminSession();

    cy.visit('/admin');
    cy.wait(['@categories', '@tags', '@adminPosts', '@feedsSummary', '@vaultSummary', '@chatRooms', '@userStats']);
    expectNoHorizontalOverflow(390);
    cy.screenshot('layout-audit-admin-mobile');

    cy.visit('/admin/access-requests');
    cy.wait('@accessRequests');
    expectNoHorizontalOverflow(390);
    cy.screenshot('layout-audit-access-requests-mobile');

    cy.visit('/guestbook');
    cy.wait('@guestbook');
    expectNoHorizontalOverflow(390);
    cy.screenshot('layout-audit-guestbook-mobile');

    cy.clearCookie('auth-token');
    cy.visit('/login?redirect=%2Fguestbook', {
      onBeforeLoad(win) {
        win.localStorage.clear();
        win.sessionStorage.clear();
      },
    });
    cy.contains('Professional Development Blog').should('be.visible');
    expectNoHorizontalOverflow(390);
    cy.screenshot('layout-audit-login-mobile');
  });

  it('시나리오: 데스크톱 해상도에서 관리자 카드와 설명 문구가 정렬된다', () => {
    cy.viewport(1440, 900);
    seedAdminSession();

    cy.visit('/admin');
    cy.wait(['@categories', '@tags', '@adminPosts', '@feedsSummary', '@vaultSummary', '@chatRooms', '@userStats']);
    expectNoHorizontalOverflow(1440);
    cy.screenshot('layout-audit-admin-desktop');

    cy.visit('/admin/access-requests');
    cy.wait('@accessRequests');
    expectNoHorizontalOverflow(1440);
    cy.screenshot('layout-audit-access-requests-desktop');
  });
});
