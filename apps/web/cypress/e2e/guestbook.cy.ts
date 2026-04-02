/// <reference types="cypress" />

export {};

type GuestbookEntry = {
  id: string;
  authorName: string;
  isAdmin: boolean;
  canDelete: boolean;
  content: string;
  createdAt: string;
};

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  message?: string | null;
  errorCode?: string | null;
  timestamp: string;
};

function success<T>(data: T, message: string | null = null): ApiEnvelope<T> {
  return {
    success: true,
    data,
    message,
    errorCode: null,
    timestamp: '2026-04-02T00:00:00',
  };
}

function pageOf(entries: GuestbookEntry[], page = 0, size = 12) {
  return {
    content: entries.slice(page * size, page * size + size),
    totalElements: entries.length,
    totalPages: Math.max(1, Math.ceil(entries.length / size)),
    size,
    number: page,
    first: page === 0,
    last: page >= Math.ceil(entries.length / size) - 1,
    empty: entries.length === 0,
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

describe('방명록 사용자 시나리오', () => {
  beforeEach(() => {
    stubShellApis();
  });

  it('시나리오: 비로그인 방문자는 방명록에서 안내를 보고 로그인 페이지로 이동할 수 있다', () => {
    cy.intercept('GET', '**/api/guestbook?page=0&size=12', {
      statusCode: 200,
      body: success(pageOf([])),
    }).as('guestbook');

    cy.visit('/guestbook');
    cy.wait('@guestbook');

    cy.get('[data-cy="guestbook-login-cta"]').should('contain.text', '로그인하고 남기기').click();
    cy.url().should('include', '/login?redirect=%2Fguestbook');
  });

  it('시나리오: 로그인 사용자는 방명록을 남기고 자신이 남긴 글을 직접 삭제할 수 있다', () => {
    let entries: GuestbookEntry[] = [
      {
        id: 'entry-1',
        authorName: '기존 방문자',
        isAdmin: false,
        canDelete: false,
        content: '먼저 남긴 인사입니다.',
        createdAt: '2026-04-02T09:00:00',
      },
    ];

    cy.intercept('GET', '**/api/auth/me', {
      statusCode: 200,
      body: success({
        id: 'user-1',
        email: 'developerkscold@gmail.com',
        username: 'kscold',
        displayName: '김승찬',
        role: 'USER',
      }),
    }).as('authMe');

    cy.intercept('GET', '**/api/guestbook?page=0&size=12', req => {
      req.reply({
        statusCode: 200,
        body: success(pageOf(entries)),
      });
    }).as('guestbook');

    cy.intercept('POST', '**/api/guestbook', req => {
      const newEntry: GuestbookEntry = {
        id: 'entry-2',
        authorName: '김승찬',
        isAdmin: false,
        canDelete: true,
        content: req.body.content,
        createdAt: '2026-04-02T10:00:00',
      };
      entries = [newEntry, ...entries];
      req.reply({
        statusCode: 201,
        body: success(newEntry, '방명록이 작성되었습니다'),
      });
    }).as('createGuestbook');

    cy.intercept('DELETE', '**/api/guestbook/*', req => {
      const entryId = req.url.split('/').pop();
      entries = entries.filter(entry => entry.id !== entryId);
      req.reply({
        statusCode: 204,
        body: '',
      });
    }).as('deleteGuestbook');

    cy.visit('/guestbook', {
      onBeforeLoad(win) {
        win.localStorage.setItem('accessToken', 'fake-access-token');
        win.localStorage.setItem('refreshToken', 'fake-refresh-token');
      },
    });

    cy.wait('@authMe');
    cy.wait('@guestbook');

    cy.get('[data-cy="guestbook-textarea"]').type('방명록 시나리오 테스트입니다.');
    cy.get('[data-cy="guestbook-submit"]').click();
    cy.wait('@createGuestbook');
    cy.wait('@guestbook');

    cy.get('[data-cy="guestbook-entry"]').first().should('contain.text', '방명록 시나리오 테스트입니다.');
    cy.get('[data-cy="guestbook-entry"]').first().find('[data-cy="guestbook-delete"]').should('exist').click();

    cy.wait('@deleteGuestbook');
    cy.wait('@guestbook');
    cy.get('[data-cy="guestbook-entry"]').should('have.length', 1);
    cy.get('[data-cy="guestbook-entry"]').first().should('contain.text', '먼저 남긴 인사입니다.');
  });

  it('시나리오: 삭제 권한이 없는 방명록에는 삭제 버튼이 보이지 않는다', () => {
    const entries: GuestbookEntry[] = [
      {
        id: 'entry-1',
        authorName: '방문자 A',
        isAdmin: false,
        canDelete: false,
        content: '삭제 권한이 없는 글입니다.',
        createdAt: '2026-04-02T09:00:00',
      },
      {
        id: 'entry-2',
        authorName: '관리자',
        isAdmin: true,
        canDelete: true,
        content: '관리자는 직접 정리할 수 있습니다.',
        createdAt: '2026-04-02T10:00:00',
      },
    ];

    cy.intercept('GET', '**/api/auth/me', {
      statusCode: 200,
      body: success({
        id: 'admin-1',
        email: 'developerkscold@gmail.com',
        username: 'kscold',
        displayName: '김승찬',
        role: 'ADMIN',
      }),
    }).as('authMe');

    cy.intercept('GET', '**/api/guestbook?page=0&size=12', {
      statusCode: 200,
      body: success(pageOf(entries)),
    }).as('guestbook');

    cy.visit('/guestbook', {
      onBeforeLoad(win) {
        win.localStorage.setItem('accessToken', 'fake-access-token');
      },
    });

    cy.wait('@authMe');
    cy.wait('@guestbook');

    cy.get('[data-cy="guestbook-entry"]').eq(0).find('[data-cy="guestbook-delete"]').should('not.exist');
    cy.get('[data-cy="guestbook-entry"]').eq(1).find('[data-cy="guestbook-delete"]').should('exist');
  });
});
