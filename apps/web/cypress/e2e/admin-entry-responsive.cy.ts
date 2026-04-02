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
  const emptyPage = {
    content: [],
    totalElements: 0,
    totalPages: 0,
    size: 5,
    number: 0,
    first: true,
    last: true,
    empty: true,
  };

  cy.intercept('GET', '**/api/posts/admin?page=0&size=5', {
    statusCode: 200,
    body: success(emptyPage),
  }).as('adminPosts');

  cy.intercept('GET', '**/api/posts/admin?page=0&size=1', {
    statusCode: 200,
    body: success({ ...emptyPage, size: 1 }),
  }).as('adminPostsMeta');

  cy.intercept('GET', '**/api/feeds?page=0&size=1', {
    statusCode: 200,
    body: success({ ...emptyPage, size: 1 }),
  }).as('feeds');

  cy.intercept('GET', '**/api/vault/notes?page=0&size=1', {
    statusCode: 200,
    body: success({ ...emptyPage, size: 1 }),
  }).as('vaultNotes');

  cy.intercept('GET', '**/api/admin/chat/rooms', {
    statusCode: 200,
    body: success([]),
  }).as('chatRooms');
}

function visitAsAdmin() {
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
  cy.visit('/');

  cy.wait(['@categories', '@tags']);
}

function expectWithinViewport(selector: string, width: number) {
  cy.get(selector).should('be.visible').then($el => {
    const rect = $el[0].getBoundingClientRect();
    expect(rect.left).to.be.gte(0);
    expect(rect.right).to.be.lte(width);
  });
}

const mobileViewports = [
  { label: 'iphone-se', width: 320, height: 568 },
  { label: 'galaxy-s8', width: 360, height: 740 },
  { label: 'iphone-14', width: 390, height: 844 },
  { label: 'iphone-14-plus', width: 430, height: 932 },
  { label: 'ipad-mini', width: 768, height: 1024 },
];

const desktopViewports = [
  { label: 'small-laptop', width: 1024, height: 768 },
  { label: 'desktop', width: 1280, height: 800 },
  { label: 'wide-desktop', width: 1440, height: 900 },
];

describe('관리자 진입 반응형 시나리오', () => {
  beforeEach(() => {
    stubShellApis();
    stubAdminDashboardApis();
  });

  mobileViewports.forEach(({ label, width, height }) => {
    it(`시나리오: ${label} 해상도에서는 사이드바에서 Admin으로 이동할 수 있다`, () => {
      cy.viewport(width, height);
      visitAsAdmin();

      cy.window().then(win => {
        expect(win.document.documentElement.scrollWidth).to.be.lte(width);
      });

      expectWithinViewport('[data-cy="sidebar-toggle"]', width);
      cy.get('[data-cy="sidebar-toggle"]').click();
      expectWithinViewport('[data-cy="sidebar-link-admin"]', width);
      cy.get('[data-cy="sidebar-link-admin"]').click();
      cy.wait(['@adminPosts', '@adminPostsMeta', '@feeds', '@vaultNotes', '@chatRooms']);
      cy.url().should('include', '/admin');
      cy.contains('Dashboard').should('be.visible');
    });
  });

  desktopViewports.forEach(({ label, width, height }) => {
    it(`시나리오: ${label} 해상도에서는 헤더에서 Admin으로 이동할 수 있다`, () => {
      cy.viewport(width, height);
      visitAsAdmin();

      cy.window().then(win => {
        expect(win.document.documentElement.scrollWidth).to.be.lte(width);
      });

      expectWithinViewport('[data-cy="admin-header-link"]', width);
      cy.get('[data-cy="admin-header-link"]').click();
      cy.wait(['@adminPosts', '@adminPostsMeta', '@feeds', '@vaultNotes', '@chatRooms']);
      cy.url().should('include', '/admin');
      cy.contains('Dashboard').should('be.visible');
    });
  });
});
