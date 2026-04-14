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

function createUserAccessToken() {
  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = base64UrlEncode(
    JSON.stringify({
      sub: 'user-1',
      role: 'USER',
      type: 'access',
      exp: Math.floor(Date.now() / 1000) + 60 * 60,
    })
  );

  return `${header}.${payload}.signature`;
}

function seedUserSession() {
  const accessToken = createUserAccessToken();
  const persistedAuth = JSON.stringify({
    state: {
      user: {
        id: 'user-1',
        email: 'feed-user@example.com',
        username: 'feeduser',
        displayName: '피드유저',
        role: 'USER',
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

function stubFeedComposerApis() {
  cy.intercept('GET', '**/api/auth/me', {
    statusCode: 200,
    body: success({
      id: 'user-1',
      email: 'feed-user@example.com',
      username: 'feeduser',
      displayName: '피드유저',
      role: 'USER',
    }),
  }).as('authMe');

  cy.intercept('GET', '**/api/feeds?page=0&size=12', {
    statusCode: 200,
    body: success({
      content: [],
      totalElements: 0,
      totalPages: 0,
      size: 12,
      number: 0,
      first: true,
      last: true,
      empty: true,
    }),
  }).as('feeds');

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

  cy.intercept('POST', '**/api/feeds', req => {
    expect(req.body.content).to.contain('공개 피드 작성기 시나리오');
    expect(req.body.linkUrl).to.eq('https://kscold.com/info/team');

    req.reply({
      statusCode: 200,
      body: success({
        id: 'feed-1',
        content: req.body.content,
        images: req.body.images ?? [],
        author: {
          id: 'user-1',
          name: '피드유저',
        },
        visibility: 'PUBLIC',
        linkPreview: {
          url: 'https://kscold.com/info/team',
          title: 'Colding 소개',
          description: '브랜드와 프로젝트 방향을 소개하는 안내 페이지입니다.',
          image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
          siteName: 'KSCOLD',
        },
        likesCount: 0,
        commentsCount: 0,
        views: 0,
        isLiked: false,
        createdAt: '2026-04-05T00:00:00',
        updatedAt: '2026-04-05T00:00:00',
      }),
    });
  }).as('createFeed');
}

function expectNoHorizontalOverflow(width: number) {
  cy.document().then(doc => {
    expect(doc.documentElement.scrollWidth).to.be.lte(width + 1);
  });
}

describe('공개 피드 작성기 시나리오', () => {
  beforeEach(() => {
    stubFeedComposerApis();
    seedUserSession();
  });

  [
    { label: 'mobile', width: 390, height: 844 },
    { label: 'desktop', width: 1440, height: 900 },
  ].forEach(viewport => {
    it(`시나리오: ${viewport.label} 해상도에서도 로그인 사용자가 피드를 편하게 작성할 수 있다`, () => {
      cy.viewport(viewport.width, viewport.height);
      cy.visit('/feed');
      cy.wait(['@authMe', '@feeds']);

      cy.get('[data-cy="feed-composer"]').should('be.visible');
      cy.contains('지금 흐름 남기기').should('be.visible');
      cy.contains('이미지 바로 첨부').should('be.visible');
      cy.contains('링크 함께 정리').should('be.visible');
      cy.get('[data-cy="feed-composer-link-input"]').should('not.exist');
      cy.contains('링크와 이미지 더하기').should('be.visible').click();
      cy.get('[data-cy="feed-composer-link-input"]').should('be.visible');
      cy.contains('링크와 이미지 패널 닫기').should('be.visible').click();
      cy.get('[data-cy="feed-composer-link-input"]').should('not.exist');

      cy.get('[data-cy="feed-composer-content"]').should('be.visible').type('공개 피드 작성기 시나리오를 점검합니다.');
      cy.get('[data-cy="feed-composer-link-input"]').should('be.visible').type('https://kscold.com/info/team');
      cy.wait('@linkPreview');
      cy.contains('Colding 소개').should('be.visible');

      cy.get('[data-cy="feed-composer-upload"]').scrollIntoView().should('exist');
      cy.get('[data-cy="feed-composer-submit"]').scrollIntoView().click();
      cy.wait('@createFeed');
      cy.wait('@feeds');

      cy.get('[data-cy="feed-composer-content"]').should('have.value', '');
      cy.get('[data-cy="feed-composer-link-input"]').should('not.exist');

      expectNoHorizontalOverflow(viewport.width);
    });
  });
});
