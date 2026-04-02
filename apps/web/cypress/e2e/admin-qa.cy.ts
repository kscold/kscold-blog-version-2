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
    timestamp: '2026-04-02T00:00:00',
  };
}

function base64UrlEncode(value: string) {
  const encoded = new TextEncoder().encode(value);
  const binary = Array.from(encoded, byte => String.fromCharCode(byte)).join('');
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
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

  return accessToken;
}

function stubShellApis() {
  cy.intercept('GET', '**/api/categories', {
    statusCode: 200,
    body: success([]),
  }).as('categories');

  cy.intercept('GET', '**/api/tags', {
    statusCode: 200,
    body: success([]),
  }).as('tags');
}

function stubAdminDashboardApis() {
  cy.intercept('GET', '**/api/posts/admin?page=0&size=5', {
    statusCode: 200,
    body: success({
      content: [],
      totalElements: 0,
      totalPages: 0,
      size: 5,
      number: 0,
      first: true,
      last: true,
      empty: true,
    }),
  }).as('adminPosts');

  cy.intercept('GET', '**/api/posts/admin?page=0&size=1', {
    statusCode: 200,
    body: success({
      content: [],
      totalElements: 0,
      totalPages: 0,
      size: 1,
      number: 0,
      first: true,
      last: true,
      empty: true,
    }),
  }).as('adminPostsMeta');

  cy.intercept('GET', '**/api/feeds?page=0&size=1', {
    statusCode: 200,
    body: success({
      content: [],
      totalElements: 0,
      totalPages: 0,
      size: 1,
      number: 0,
      first: true,
      last: true,
      empty: true,
    }),
  }).as('feeds');

  cy.intercept('GET', '**/api/vault/notes?page=0&size=1', {
    statusCode: 200,
    body: success({
      content: [],
      totalElements: 0,
      totalPages: 0,
      size: 1,
      number: 0,
      first: true,
      last: true,
      empty: true,
    }),
  }).as('vaultNotes');

  cy.intercept('GET', '**/api/admin/chat/rooms', {
    statusCode: 200,
    body: success([]),
  }).as('chatRooms');
}

describe('어드민 QA 진입 시나리오', () => {
  beforeEach(() => {
    stubShellApis();
    stubAdminDashboardApis();
  });

  it('시나리오: 관리자는 대시보드 빠른 작업에서 QA / E2E 페이지로 이동할 수 있다', () => {
    seedAdminSession();

    cy.visit('/admin');

    cy.wait(['@categories', '@tags', '@adminPosts', '@adminPostsMeta', '@feeds', '@vaultNotes', '@chatRooms']);
    cy.get('[data-cy="admin-qa-link"]').should('have.attr', 'href', '/admin/testing').click();
    cy.url().should('include', '/admin/testing');
    cy.get('[data-cy="admin-qa-page"]').should('contain.text', 'QA / E2E');
  });

  it('시나리오: 관리자는 QA / E2E 페이지에서 주요 시나리오 링크와 실행 명령을 확인할 수 있다', () => {
    seedAdminSession();

    cy.visit('/admin/testing');

    cy.wait(['@categories', '@tags']);
    cy.get('[data-cy="admin-qa-scenario-home"]').should('have.attr', 'href', '/');
    cy.get('[data-cy="admin-qa-scenario-guestbook"]').should('have.attr', 'href', '/guestbook');
    cy.get('[data-cy="admin-qa-scenario-admin-chat"]').should('have.attr', 'href', '/admin/chat');
    cy.get('[data-cy="admin-qa-command-run"]').should('contain.text', 'pnpm --dir apps/web test:e2e');
    cy.get('[data-cy="admin-qa-command-open"]').should('contain.text', 'pnpm --dir apps/web cy:open');
  });
});
