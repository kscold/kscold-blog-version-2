/// <reference types="cypress" />

export {};

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
    timestamp: '2026-04-13T00:00:00',
  };
}

describe('계정 복구 시나리오', () => {
  it('시나리오: 로그인 화면에서 아이디 찾기와 비밀번호 재설정 페이지로 자연스럽게 이어진다', () => {
    cy.visit('/login');

    cy.get('[data-cy="login-find-username"]').click();
    cy.url().should('include', '/login/recovery?tab=username');

    cy.get('[data-cy="recovery-tab-password"]').click();
    cy.url().should('include', '/login/recovery?tab=password');
  });

  it('시나리오: 아이디 찾기는 이메일 입력 후 안내 메일 발송 완료 상태를 보여준다', () => {
    cy.intercept('POST', '**/api/auth/recover-username', req => {
      expect(req.body).to.deep.equal({ email: 'hello@kscold.com' });
      req.reply({
        statusCode: 200,
        body: success(null, '가입한 이메일로 아이디 안내를 보냈습니다.'),
      });
    }).as('recoverUsername');

    cy.visit('/login/recovery?tab=username');
    cy.get('[data-cy="recovery-email-input"]').type('hello@kscold.com');
    cy.get('[data-cy="recovery-submit"]').click();

    cy.wait('@recoverUsername');
    cy.get('[data-cy="recovery-success"]').should('contain.text', '가입한 이메일로 아이디 안내를 보냈습니다');
  });

  it('시나리오: 비밀번호 재설정 탭은 메일함으로 링크를 보내고 성공 상태를 보여준다', () => {
    cy.intercept('POST', '**/api/auth/request-password-reset', req => {
      expect(req.body).to.deep.equal({ email: 'hello@kscold.com' });
      req.reply({
        statusCode: 200,
        body: success(null, '비밀번호 재설정 안내를 이메일로 보냈습니다.'),
      });
    }).as('requestPasswordReset');

    cy.visit('/login/recovery?tab=password');
    cy.get('[data-cy="recovery-email-input"]').type('hello@kscold.com');
    cy.get('[data-cy="recovery-submit"]').click();

    cy.wait('@requestPasswordReset');
    cy.get('[data-cy="recovery-success"]').should('contain.text', '비밀번호 재설정 링크를 이메일로 보냈습니다');
  });

  it('시나리오: 유효한 재설정 링크는 새 비밀번호를 저장하고 완료 메시지를 보여준다', () => {
    cy.intercept('GET', '**/api/auth/password-reset/validate?token=valid-token', {
      statusCode: 200,
      body: success({
        valid: true,
        message: '유효한 재설정 링크입니다.',
        expiresAt: '2026-04-13T10:30:00.000Z',
      }),
    }).as('validateResetToken');

    cy.intercept('POST', '**/api/auth/reset-password', req => {
      expect(req.body).to.deep.equal({
        token: 'valid-token',
        newPassword: 'new-password-123',
      });
      req.reply({
        statusCode: 200,
        body: success(null, '비밀번호를 다시 설정했습니다.'),
      });
    }).as('resetPassword');

    cy.visit('/login/reset-password?token=valid-token');
    cy.wait('@validateResetToken');

    cy.get('[data-cy="reset-password-input"]').type('new-password-123');
    cy.get('[data-cy="reset-password-confirm-input"]').type('new-password-123');
    cy.get('[data-cy="reset-password-submit"]').click();

    cy.wait('@resetPassword');
    cy.get('[data-cy="reset-password-success"]').should('contain.text', '새 비밀번호로 다시 로그인할 수 있습니다.');
  });
});
