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

describe('공개 페이지 핵심 시나리오', () => {
  beforeEach(() => {
    stubShellApis();
  });

  it('시나리오: 방문자는 메인에서 새 소개 문구와 주요 CTA를 확인할 수 있다', () => {
    cy.visit('/');

    cy.get('[data-cy="hero-tagline"]')
      .should('contain.text', '러닝커브를 즐기는 개발자')
      .and('contain.text', '문제를 서비스로 풀어내는')
      .and('contain.text', '프로덕트 엔지니어 김승찬입니다.');

    cy.get('[data-cy="hero-primary-cta"]').should('have.attr', 'href', '/blog');
    cy.get('[data-cy="hero-secondary-cta"]').should('have.attr', 'href', '/feed');
    cy.get('[data-cy="nav-link-guestbook"]').should('have.attr', 'href', '/guestbook');
  });

  it('시나리오: 방문자는 헤더에서 방명록으로 이동해 빈 상태를 확인할 수 있다', () => {
    cy.intercept('GET', '**/api/guestbook?page=0&size=12', {
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
    }).as('guestbook');

    cy.visit('/');
    cy.get('[data-cy="nav-link-guestbook"]').click();

    cy.url().should('include', '/guestbook');
    cy.wait('@guestbook');
    cy.get('[data-cy="guestbook-title"]').should('contain.text', '방명록을 남겨주세요');
    cy.get('[data-cy="guestbook-empty-state"]').should('contain.text', '첫 번째 인사를 남겨주세요.');
  });
});
