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
    timestamp: '2026-04-05T00:00:00',
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

function stubFeedApis() {
  cy.intercept('GET', '**/api/link-preview?url=*', {
    statusCode: 200,
    body: success({
      url: 'https://kscold.com/info/team',
      title: 'Colding 소개',
      description: '브랜드와 프로젝트 방향을 소개하는 안내 페이지입니다.',
      image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
      siteName: 'KSCOLD',
    }),
  }).as('linkPreview');
}

function expectNoHorizontalOverflow(width: number) {
  cy.document().then(doc => {
    expect(doc.documentElement.scrollWidth).to.be.lte(width + 1);
  });
}

describe('피드 에디터 반응형 시나리오', () => {
  beforeEach(() => {
    stubFeedApis();
    seedAdminSession();
  });

  [
    { label: 'mobile', width: 390, height: 844 },
    { label: 'desktop', width: 1440, height: 900 },
  ].forEach(viewport => {
    it(`시나리오: ${viewport.label} 해상도에서도 피드 작성 흐름이 편하게 이어진다`, () => {
      cy.viewport(viewport.width, viewport.height);
      cy.visit('/admin/feed/new');

      cy.get('[data-cy="feed-editor-surface"]').should('be.visible');
      cy.get('[data-cy="feed-editor-content"]').should('be.visible').type('노션형 피드 작성기 흐름 점검');
      cy.get('[data-cy="feed-editor-images"]').should('be.visible');
      cy.get('[data-cy="feed-editor-link-input"]').should('be.visible').type('https://kscold.com/info/team');
      cy.wait('@linkPreview');
      cy.contains('Colding 소개').should('be.visible');

      cy.get('[data-cy="feed-editor-sidebar"]').scrollIntoView().should('be.visible');
      cy.get('[data-cy="feed-editor-upload"]').scrollIntoView().should('exist');
      cy.get('[data-cy="feed-editor-visibility"]').should('be.visible');
      cy.get('[data-cy="feed-editor-submit"]').scrollIntoView().should('exist');

      expectNoHorizontalOverflow(viewport.width);
    });
  });
});
