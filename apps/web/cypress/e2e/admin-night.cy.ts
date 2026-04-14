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
    timestamp: '2026-04-14T00:00:00',
  };
}

function base64UrlEncode(value: string) {
  const encoded = new TextEncoder().encode(value);
  const binary = Array.from(encoded, (byte) => String.fromCharCode(byte)).join('');
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function seedAdminSession() {
  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = base64UrlEncode(JSON.stringify({ sub: 'admin-1', role: 'ADMIN', type: 'access', exp: Math.floor(Date.now() / 1000) + 3600 }));
  const accessToken = `${header}.${payload}.signature`;
  const persistedAuth = JSON.stringify({
    state: {
      user: { id: 'admin-1', email: 'developerkscold@gmail.com', username: 'kscold', displayName: '김승찬', role: 'ADMIN' },
      token: accessToken,
    },
    version: 0,
  });

  cy.visit('/login');
  cy.setCookie('auth-token', accessToken);
  cy.window().then((win) => {
    win.localStorage.setItem('accessToken', accessToken);
    win.localStorage.setItem('refreshToken', 'fake-refresh-token');
    win.localStorage.setItem('auth-storage', persistedAuth);
  });
}

function stubAdminDashboardApis() {
  cy.intercept('GET', '**/api/categories', { statusCode: 200, body: success([{ id: 'cat-1', name: '개발 이야기', slug: 'dev-story', postCount: 16 }]) }).as('categories');
  cy.intercept('GET', '**/api/tags', { statusCode: 200, body: success([]) }).as('tags');
  cy.intercept('GET', '**/api/posts/admin?page=0&size=5', {
    statusCode: 200,
    body: success({
      content: [
        { id: 'post-1', title: '야간 배포 체크리스트', slug: 'night-ship', content: '', excerpt: '', category: { id: 'cat-1', name: '개발 이야기', slug: 'dev-story' }, tags: [], author: { id: 'a', name: 'kscold' }, status: 'DRAFT', featured: false, views: 12, likes: 0, createdAt: '2026-04-14T00:00:00Z', updatedAt: '2026-04-14T00:00:00Z' },
        { id: 'post-2', title: '링크 카드 QA 메모', slug: 'qa-note', content: '', excerpt: '', category: { id: 'cat-1', name: '개발 이야기', slug: 'dev-story' }, tags: [], author: { id: 'a', name: 'kscold' }, status: 'PUBLISHED', featured: false, views: 23, likes: 0, createdAt: '2026-04-13T00:00:00Z', updatedAt: '2026-04-13T00:00:00Z' },
        { id: 'post-3', title: '채팅 답장 플로우 정리', slug: 'chat-flow', content: '', excerpt: '', category: { id: 'cat-1', name: '개발 이야기', slug: 'dev-story' }, tags: [], author: { id: 'a', name: 'kscold' }, status: 'ARCHIVED', featured: false, views: 3, likes: 0, createdAt: '2026-04-12T00:00:00Z', updatedAt: '2026-04-12T00:00:00Z' },
      ],
      totalElements: 3,
      totalPages: 1,
      size: 5,
      number: 0,
      first: true,
      last: true,
      empty: false,
    }),
  }).as('adminPosts');
  cy.intercept('GET', '**/api/posts/admin?page=0&size=1', { statusCode: 200, body: success({ content: [], totalElements: 3, totalPages: 3, size: 1, number: 0, first: true, last: false, empty: false }) }).as('adminPostsMeta');
  cy.intercept('GET', '**/api/feeds?page=0&size=1', { statusCode: 200, body: success({ content: [], totalElements: 2, totalPages: 2, size: 1, number: 0, first: true, last: false, empty: false }) }).as('feeds');
  cy.intercept('GET', '**/api/vault/notes?page=0&size=1', { statusCode: 200, body: success({ content: [], totalElements: 14, totalPages: 14, size: 1, number: 0, first: true, last: false, empty: false }) }).as('vault');
  cy.intercept('GET', '**/api/admin/chat/rooms', { statusCode: 200, body: success([{ roomId: 'room-1', username: 'reader-one', lastMessage: '답장 부탁드립니다', lastTimestamp: '2026-04-14T00:00:00Z', messageCount: 4 }]) }).as('chatRooms');
  cy.intercept('GET', '**/api/admin/users/stats', {
    statusCode: 200,
    body: { totalUsers: 12, newUsersToday: 1, newUsersThisWeek: 3, newUsersThisMonth: 7, dailySignups: [], recentUsers: [] },
  }).as('userStats');
}

describe('어드민 나이트 대시보드 시나리오', () => {
  beforeEach(() => {
    stubAdminDashboardApis();
    seedAdminSession();
  });

  it('시나리오: 어드민 대시보드에 야간 운영 보드와 실제 링크가 자연스럽게 노출된다', () => {
    cy.visit('/admin');
    cy.wait(['@categories', '@tags', '@adminPosts', '@adminPostsMeta', '@feeds', '@vault', '@chatRooms', '@userStats']);
    cy.get('[data-cy="admin-night-section"]').should('contain.text', 'Admin Night');
    cy.get('[data-cy="admin-night-slot-today"]').should('contain.text', 'Tonight');
    cy.get('[data-cy="admin-night-action-workspace"]').should('have.attr', 'href').and('include', '/admin/posts/');
    cy.get('[data-cy="admin-night-action-review"]').should('have.attr', 'href', '/admin/testing');
    cy.get('[data-cy="admin-night-action-reply"]').should('have.attr', 'href', '/admin/chat');
    cy.screenshot('admin-night-desktop');
  });

  it('시나리오: 모바일 해상도에서도 어드민 나이트 보드가 가로로 깨지지 않는다', () => {
    cy.viewport(390, 844);
    cy.visit('/admin');
    cy.wait(['@categories', '@tags', '@adminPosts', '@adminPostsMeta', '@feeds', '@vault', '@chatRooms', '@userStats']);
    cy.window().then((win) => {
      expect(win.document.documentElement.scrollWidth).to.be.lte(390);
    });
    cy.get('[data-cy="admin-night-section"]').should('contain.text', '오늘 밤 같이 붙을 흐름');
    cy.screenshot('admin-night-mobile');
  });
});
