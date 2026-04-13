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

function stubEditorApis() {
  cy.intercept('GET', '**/api/categories', {
    statusCode: 200,
    body: success([
      {
        id: 'cat-1',
        name: 'Dev Story',
        slug: 'dev-story',
        depth: 0,
        icon: '✦',
        restricted: true,
      },
      {
        id: 'cat-2',
        name: 'Frontend',
        slug: 'frontend',
        depth: 1,
        parent: 'cat-1',
        restricted: false,
      },
    ]),
  }).as('categories');

  cy.intercept('GET', '**/api/tags', {
    statusCode: 200,
    body: success([
      { id: 'tag-1', name: 'Next.js', slug: 'next-js', postCount: 4 },
      { id: 'tag-2', name: 'Tiptap', slug: 'tiptap', postCount: 2 },
    ]),
  }).as('tags');
}

function expectNoHorizontalOverflow(width: number) {
  cy.document().then(doc => {
    expect(doc.documentElement.scrollWidth).to.be.lte(width + 1);
  });
}

describe('포스트 에디터 반응형 시나리오', () => {
  beforeEach(() => {
    stubEditorApis();
    seedAdminSession();
  });

  [
    { label: 'mobile', width: 390, height: 844 },
    { label: 'desktop', width: 1440, height: 900 },
  ].forEach(viewport => {
    it(`시나리오: ${viewport.label} 해상도에서도 노션형 포스트 에디터를 편하게 사용할 수 있다`, () => {
      cy.viewport(viewport.width, viewport.height);
      cy.visit('/admin/posts/new');
      cy.wait(['@categories', '@tags']);

      cy.get('[data-cy="post-editor-surface"]').should('be.visible');
      cy.get('[data-cy="post-editor-cover"]').should('be.visible');
      cy.get('[data-cy="post-editor-title"]').should('be.visible');
      cy.get('[data-cy="post-editor-slug"]').should('be.visible');
      cy.get('[data-cy="post-editor-document"]', { timeout: 20000 }).should('be.visible');
      cy.get('[data-cy="post-editor-toolbar"]', { timeout: 20000 }).scrollIntoView().should('exist');
      cy.get('[data-cy="post-editor-quick-actions"]', { timeout: 20000 }).scrollIntoView().should('exist');

      cy.get('[data-cy="post-editor-title"]').type('노션형 작성기 테스트');
      cy.get('[data-cy="post-editor-sidebar"]').scrollIntoView();
      cy.get('[data-cy="post-editor-category"]').should('be.visible');
      cy.get('[data-cy="post-editor-public-override"]').should('be.visible');
      cy.get('[data-cy="post-editor-submit"]').scrollIntoView().should('exist');

      expectNoHorizontalOverflow(viewport.width);
    });
  });

  it('시나리오: 제한 카테고리에서도 완전 공개 토글로 요청 없이 바로 공개할 수 있다', () => {
    cy.viewport(1440, 900);
    cy.visit('/admin/posts/new');
    cy.wait(['@categories', '@tags']);

    cy.get('[data-cy="post-editor-category"]').select('cat-1');
    cy.contains('현재 제한 카테고리라서 기본적으로 열람 요청이 필요합니다.').should('be.visible');
    cy.get('[data-cy="post-editor-public-override"]').check({ force: true });
    cy.contains('현재 제한 카테고리지만, 이 글은 완전 공개로 우선 적용됩니다.').should('be.visible');
  });

  it('시나리오: 작성기는 코드 블록 언어를 지정하면 미리보기에서 올바르게 인식한다', () => {
    cy.viewport(1440, 900);
    cy.visit('/admin/posts/new');
    cy.wait(['@categories', '@tags']);

    cy.window().then(win => {
      cy.stub(win, 'prompt').returns('ts');
    });

    cy.get('.ProseMirror', { timeout: 20000 })
      .click()
      .type('const total = 42;{enter}console.log(total);', {
        parseSpecialCharSequences: false,
      });

    cy.contains('button', '코드').click();
    cy.contains('button', '언어').click();
    cy.contains('button', 'TS').should('be.visible');

    cy.get('[data-cy="post-editor-view-preview"]').click();
    cy.get('[data-code-language="ts"]', { timeout: 10000 })
      .should('be.visible')
      .and('contain.text', 'TypeScript');
    cy.contains('const total = 42;').should('be.visible');
  });

  it('시나리오: 작성기는 mermaid 코드 블록을 다이어그램으로 미리보기한다', () => {
    cy.viewport(1440, 900);
    cy.visit('/admin/posts/new');
    cy.wait(['@categories', '@tags']);

    cy.window().then(win => {
      cy.stub(win, 'prompt').returns('mermaid');
    });

    cy.get('.ProseMirror', { timeout: 20000 })
      .click()
      .type('graph TD; A[Login] --> B[Approved]; B --> C[Read Post]', {
        parseSpecialCharSequences: false,
      });

    cy.contains('button', '코드').click();
    cy.contains('button', '언어').click();
    cy.contains('button', 'MERMAID').should('be.visible');

    cy.get('[data-cy="post-editor-view-preview"]').click();
    cy.get('[data-code-language="mermaid"]', { timeout: 10000 }).should('be.visible');
    cy.get('[data-mermaid-status="rendered"]', { timeout: 20000 }).should('be.visible');
    cy.get('.mermaid-diagram svg', { timeout: 20000 }).should('be.visible');
  });

  it('시나리오: 작성기는 비디오 링크를 노션처럼 임베드 미리보기한다', () => {
    cy.viewport(1440, 900);
    cy.visit('/admin/posts/new');
    cy.wait(['@categories', '@tags']);

    cy.window().then(win => {
      cy.stub(win, 'prompt').returns('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    });

    cy.contains('button', '비디오').click();
    cy.get('[data-cy="post-editor-view-preview"]').click();
    cy.get('iframe[data-video-provider="youtube"]', { timeout: 10000 }).should('be.visible');
  });
});
