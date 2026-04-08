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
}

describe('열람 요청 관리 시나리오', () => {
  it('시나리오: 관리자는 글 단위 또는 카테고리 단위로 승인 범위를 선택할 수 있다', () => {
    seedAdminSession();

    cy.intercept('GET', '**/api/admin/access-requests', {
      statusCode: 200,
      body: success([
        {
          id: 'req-1',
          userId: 'user-1',
          username: 'reader-one',
          postId: 'post-1',
          postTitle: '권한 모델 정리',
          postSlug: 'access-model',
          categoryId: 'cat-1',
          categoryName: '개발 이야기',
          status: 'PENDING',
          message: '이 글을 읽고 싶습니다.',
          createdAt: '2026-04-08T09:00:00Z',
        },
        {
          id: 'req-2',
          userId: 'user-2',
          username: 'reader-two',
          categoryId: 'cat-1',
          categoryName: '개발 이야기',
          status: 'PENDING',
          message: '예전 방식 요청입니다.',
          createdAt: '2026-04-08T10:00:00Z',
        },
      ]),
    }).as('pendingRequests');

    cy.intercept('PUT', '**/api/admin/access-requests/req-1/approve', req => {
      expect(req.body).to.deep.equal({ grantScope: 'CATEGORY' });
      req.reply({
        statusCode: 200,
        body: success({ id: 'req-1' }),
      });
    }).as('approveCategoryScope');

    cy.visit('/admin/access-requests');
    cy.wait('@pendingRequests');

    cy.get('[data-cy="access-request-req-1"]').should('contain.text', 'reader-one');
    cy.get('[data-cy="access-request-req-1"]').should('contain.text', '권한 모델 정리');
    cy.get('[data-cy="access-request-req-1-scope-category"]')
      .click()
      .should('contain.text', '카테고리 전체 승인')
      .and('contain.text', '같은 카테고리의 제한 글 전체를 열람할 수 있게');
    cy.get('[data-cy="access-request-req-1-approve"]').click();

    cy.wait('@approveCategoryScope');
    cy.get('[data-cy="access-request-req-1"]').should('not.exist');
    cy.get('[data-cy="access-request-req-2-scope-post"]').should('be.disabled');
  });
});
