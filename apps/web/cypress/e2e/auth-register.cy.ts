/// <reference types="cypress" />

export {};

type ApiEnvelope<T> = {
  success: boolean;
  data?: T;
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
    timestamp: '2026-04-14T00:00:00',
  };
}

describe('회원가입 시나리오', () => {
  it('시나리오: 짧은 비밀번호는 서버 요청 전 프런트에서 바로 안내한다', () => {
    cy.intercept('POST', '**/api/auth/register').as('registerAttempt');

    cy.visit('/login');
    cy.get('[data-cy="auth-toggle-register"]').click();

    cy.get('[data-cy="register-email-input"]').type('short-password@example.com');
    cy.get('[data-cy="register-username-input"]').type('ㄱㄱㅁ');
    cy.get('[data-cy="register-display-name-input"]').type('ㄱㄱㅁ');
    cy.get('[data-cy="register-password-input"]').type('1234');
    cy.get('[data-cy="register-submit"]').click();

    cy.get('[data-cy="auth-form-error"]').should('contain.text', '비밀번호는 최소 8자 이상이어야 합니다.');
    cy.get('@registerAttempt.all').should('have.length', 0);
  });

  it('시나리오: 서버가 400을 내려도 회원가입 폼은 검증 메시지를 그대로 보여준다', () => {
    cy.intercept('POST', '**/api/auth/register', req => {
      expect(req.body.username).to.equal('ㄱㄱㅁ');
      req.reply({
        statusCode: 400,
        body: {
          success: false,
          message: '비밀번호는 최소 8자 이상이어야 합니다',
          errorCode: 'E001',
          timestamp: '2026-04-14T16:21:02.465+09:00',
        },
      });
    }).as('register');

    cy.visit('/login');
    cy.get('[data-cy="auth-toggle-register"]').click();

    cy.get('[data-cy="register-email-input"]').type('server-validation@example.com');
    cy.get('[data-cy="register-username-input"]').type('ㄱㄱㅁ');
    cy.get('[data-cy="register-display-name-input"]').type('ㄱㄱㅁ');
    cy.get('[data-cy="register-password-input"]').type('12345678');
    cy.get('[data-cy="register-submit"]').click();

    cy.wait('@register');
    cy.get('[data-cy="auth-form-error"]').should('contain.text', '비밀번호는 최소 8자 이상이어야 합니다');
    cy.get('[data-cy="auth-form-error"]').should('not.contain.text', 'Request failed with status code 400');
  });

  it('시나리오: ㄱㄱㅁ 같은 한글 사용자명도 유효한 비밀번호면 회원가입 응답을 정상 처리한다', () => {
    cy.intercept('POST', '**/api/auth/register', req => {
      expect(req.body).to.deep.equal({
        email: 'korean-register@example.com',
        username: 'ㄱㄱㅁ',
        displayName: 'ㄱㄱㅁ',
        password: 'validpass123',
      });

      req.reply({
        statusCode: 200,
        body: success(
          {
            accessToken: 'access-token',
            refreshToken: 'refresh-token',
            tokenType: 'Bearer',
            user: {
              id: 'user-1',
              email: 'korean-register@example.com',
              username: 'ㄱㄱㅁ',
              displayName: 'ㄱㄱㅁ',
              role: 'USER',
            },
          },
          '회원가입이 완료되었습니다.'
        ),
      });
    }).as('register');

    cy.visit('/login');
    cy.get('[data-cy="auth-toggle-register"]').click();

    cy.get('[data-cy="register-email-input"]').type('korean-register@example.com');
    cy.get('[data-cy="register-username-input"]').type('ㄱㄱㅁ');
    cy.get('[data-cy="register-display-name-input"]').type('ㄱㄱㅁ');
    cy.get('[data-cy="register-password-input"]').type('validpass123');
    cy.get('[data-cy="register-submit"]').click();

    cy.wait('@register');
    cy.url().should('eq', `${Cypress.config('baseUrl')}/`);
  });
});
