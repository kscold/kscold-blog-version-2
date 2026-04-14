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

function stubCalendar() {
  cy.intercept('GET', '**/api/admin-night/calendar*', {
    statusCode: 200,
    body: success([]),
  }).as('calendar');
}

describe('Admin Night 공개 페이지 시나리오', () => {
  it('시나리오: 헤더 네비게이션에서 공개 Admin Night 페이지로 이동할 수 있다', () => {
    stubCalendar();
    cy.viewport(1600, 1200);
    cy.visit('/');
    cy.get('[data-cy="nav-link-admin-night"]').click();
    cy.url().should('include', '/admin-night');
    cy.wait('@calendar');
    cy.contains('퇴근 후, 각자 할 일을 끝내는 밤').should('be.visible');
    cy.contains('신청 PR ➔ Merge / Meet').should('be.visible');
    cy.get('[data-cy="admin-night-hero-primary"]').should('have.attr', 'href', '#admin-night-request');
    cy.window().then(win => {
      expect(win.document.documentElement.scrollWidth).to.be.lte(1600);
    });
    cy.screenshot('admin-night-page-desktop');
  });

  it('시나리오: 모바일에서도 Admin Night 페이지가 가로로 깨지지 않는다', () => {
    stubCalendar();
    cy.viewport(390, 844);
    cy.visit('/admin-night');
    cy.wait('@calendar');
    cy.contains('각자 할 일을 끝내는 밤').should('be.visible');
    cy.get('[data-cy="admin-night-slot-tonight"]').should('exist');
    cy.window().then(win => {
      expect(win.document.documentElement.scrollWidth).to.be.lte(390);
    });
    cy.screenshot('admin-night-page-mobile');
  });
});
