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
    timestamp: '2026-04-03T00:00:00',
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

describe('어드민 스토리지 시나리오', () => {
  beforeEach(() => {
    stubShellApis();
    stubAdminDashboardApis();
  });

  it('시나리오: 관리자는 대시보드 빠른 작업에서 스토리지 관리 페이지로 이동할 수 있다', () => {
    seedAdminSession();

    cy.intercept('GET', '**/api/admin/storage?prefix=', {
      statusCode: 200,
      body: success({
        bucket: 'blog',
        currentPrefix: '',
        parentPrefix: null,
        folders: [],
        objects: [],
      }),
    }).as('storageRoot');

    cy.visit('/admin');

    cy.wait(['@categories', '@tags', '@adminPosts', '@adminPostsMeta', '@feeds', '@vaultNotes', '@chatRooms']);
    cy.get('[data-cy="admin-storage-link"]').should('have.attr', 'href', '/admin/storage').click();
    cy.url().should('include', '/admin/storage');
    cy.wait('@storageRoot');
    cy.get('[data-cy="admin-storage-page"]').should('contain.text', 'Storage');
  });

  it('시나리오: 관리자는 폴더 탐색과 파일 업로드/삭제 흐름을 확인할 수 있다', () => {
    seedAdminSession();

    const tinyPng = Cypress.Buffer.from(
      '89504E470D0A1A0A0000000D49484452000000010000000108060000001F15C4890000000D49444154789C6360606060000000050001A5F645400000000049454E44AE426082',
      'hex'
    );

    cy.intercept('GET', '**/api/admin/storage?prefix=', {
      statusCode: 200,
      body: success({
        bucket: 'blog',
        currentPrefix: '',
        parentPrefix: null,
        folders: [{ name: 'images', key: 'images/' }],
        objects: [
          {
            name: 'hero.png',
            key: 'hero.png',
            size: 2048,
            lastModified: '2026-04-03T01:00:00.000Z',
            isImage: true,
            publicUrl: 'https://bucket.kscold.com/blog/hero.png',
          },
        ],
      }),
    }).as('storageRoot');

    cy.intercept('GET', '**/api/admin/storage?prefix=images%2F', {
      statusCode: 200,
      body: success({
        bucket: 'blog',
        currentPrefix: 'images/',
        parentPrefix: '',
        folders: [],
        objects: [
          {
            name: 'logo.png',
            key: 'images/logo.png',
            size: 4096,
            lastModified: '2026-04-03T02:00:00.000Z',
            isImage: true,
            publicUrl: 'https://bucket.kscold.com/blog/images/logo.png',
          },
        ],
      }),
    }).as('storageImages');

    cy.intercept('GET', '**/api/admin/storage/object?key=*', {
      statusCode: 200,
      headers: {
        'content-type': 'image/png',
      },
      body: tinyPng,
    }).as('storageObjectPreview');

    cy.intercept('POST', '**/api/admin/storage/files*', req => {
      req.reply({
        statusCode: 200,
        body: success({
          bucket: 'blog',
          currentPrefix: '',
          parentPrefix: null,
          folders: [{ name: 'images', key: 'images/' }],
          objects: [
            {
              name: 'hero.png',
              key: 'hero.png',
              size: 2048,
              lastModified: '2026-04-03T01:00:00.000Z',
              isImage: true,
              publicUrl: 'https://bucket.kscold.com/blog/hero.png',
            },
            {
              name: 'new-banner.png',
              key: 'new-banner.png',
              size: 1024,
              lastModified: '2026-04-03T03:00:00.000Z',
              isImage: true,
              publicUrl: 'https://bucket.kscold.com/blog/new-banner.png',
            },
          ],
        }),
      });
    }).as('storageUpload');

    cy.intercept('DELETE', '**/api/admin/storage?prefix=*&key=*', {
      statusCode: 200,
      body: success({
        bucket: 'blog',
        currentPrefix: '',
        parentPrefix: null,
        folders: [{ name: 'images', key: 'images/' }],
        objects: [],
        deletedKeys: 1,
      }),
    }).as('storageDelete');

    cy.visit('/admin/storage');
    cy.wait(['@categories', '@tags', '@storageRoot']);

    cy.get('[data-cy="admin-storage-folder-images"]').click();
    cy.wait('@storageImages');
    cy.wait('@storageObjectPreview');
    cy.contains('logo.png').should('exist');

    cy.visit('/admin/storage');
    cy.wait('@storageRoot');
    cy.wait('@storageObjectPreview');

    cy.get('[data-cy="admin-storage-upload-input"]').selectFile(
      {
        contents: Cypress.Buffer.from('banner'),
        fileName: 'new-banner.png',
        mimeType: 'image/png',
      },
      { force: true }
    );
    cy.wait('@storageUpload');
    cy.contains('new-banner.png').should('exist');

    cy.window().then(win => {
      cy.stub(win, 'confirm').returns(true);
    });
    cy.get('[data-cy="admin-storage-delete-object-hero.png"]').click();
    cy.wait('@storageDelete');
    cy.contains('현재 경로에 파일이 없습니다.').should('exist');
  });
});
