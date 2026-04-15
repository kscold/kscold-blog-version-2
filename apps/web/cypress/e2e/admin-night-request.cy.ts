/// <reference types="cypress" />

export {};

import type { AdminNightRequest } from '@/entities/admin-night/model/types';

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
        email: 'nightowl@example.com',
        username: 'nightowl',
        displayName: '류태호',
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

function setRangeValue(selector: string, value: string) {
  cy.get(selector).then($input => {
    const input = $input[0] as HTMLInputElement;
    const descriptor = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      'value'
    );

    descriptor?.set?.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
}

describe('Admin Night 신청 시나리오', () => {
  it('시나리오: 로그인 사용자는 신청 PR을 보내고 내 신청 흐름에서 상태를 확인할 수 있다', () => {
    seedUserSession();

    let myRequests: AdminNightRequest[] = [
      {
        id: 'request-1',
        userId: 'user-1',
        requesterName: '류태호',
        requesterEmail: 'nightowl@example.com',
        taskTitle: '메일 답장 정리',
        message: '밀린 메일과 체크리스트를 털어내고 싶어요.',
        participationMode: 'FLEXIBLE',
        status: 'APPROVED',
        preferredSlot: {
          slotKey: '2026-04-14|Inbox Sweep',
          date: '2026-04-14',
          weekday: '월',
          timeLabel: '20:30 - 22:00',
          focus: 'Inbox Sweep',
          badgeLabel: 'Open',
        },
        scheduledSlot: {
          slotKey: '2026-04-15|Body Doubling',
          date: '2026-04-15',
          weekday: '화',
          timeLabel: '21:00 - 22:40',
          focus: 'Body Doubling',
          badgeLabel: 'Tonight',
        },
        createdAt: '2026-04-14T12:00:00',
      },
    ];

    cy.intercept('GET', '**/api/admin-night/calendar*', {
      statusCode: 200,
      body: success([]),
    }).as('calendar');

    cy.intercept('GET', '**/api/admin-night/requests/me', req => {
      req.reply({
        statusCode: 200,
        body: success(myRequests),
      });
    }).as('myRequests');

    cy.intercept('POST', '**/api/admin-night/requests', req => {
      expect(req.body.taskTitle).to.contain('작은 버그 수정');
      expect(req.body.requesterName).to.eq('류태호');
      expect(req.body.participationMode).to.eq('OFFLINE');
      expect(req.body.preferredSlot.timeLabel).to.eq('19:00 - 22:00');
      myRequests = [
        {
          id: 'request-2',
          userId: 'user-1',
          requesterName: '류태호',
          requesterEmail: 'nightowl@example.com',
          taskTitle: req.body.taskTitle,
          message: req.body.message,
          participationMode: req.body.participationMode,
          status: 'PENDING',
          preferredSlot: req.body.preferredSlot,
          scheduledSlot: null,
          createdAt: '2026-04-14T13:00:00',
        },
        ...myRequests,
      ];
      req.reply({
        statusCode: 201,
        body: success(myRequests[0]),
      });
    }).as('createRequest');

    cy.visit('/admin-night');
    cy.wait(['@calendar', '@myRequests']);
    cy.get('[data-cy="admin-night-request-name"]').clear().type('류태호');
    cy.get('[data-cy="admin-night-request-title"]').type('작은 버그 수정과 블로그 초안 정리');
    cy.get('[data-cy="admin-night-mode-offline"]').click();
    setRangeValue('[data-cy="admin-night-range-end"]', '1320');
    cy.get('[data-cy="admin-night-range-summary"]').should('contain.text', '19:00 - 22:00');
    cy.get('[data-cy="admin-night-request-message"]').type('퇴근 후 몰입해서 문서와 작은 버그를 같이 정리하고 싶어요.');
    cy.get('[data-cy="admin-night-request-submit"]').click();
    cy.wait('@createRequest');
    cy.wait('@myRequests');
    cy.contains('신청 PR을 보냈습니다').should('be.visible');
    cy.contains('작은 버그 수정과 블로그 초안 정리').should('be.visible');
    cy.contains('대기 중').should('be.visible');
    cy.contains('오프라인').should('be.visible');
  });

  it('시나리오: 추가 정보 요청된 신청은 보완해서 다시 보낼 수 있다', () => {
    seedUserSession();

    let myRequests: AdminNightRequest[] = [
      {
        id: 'request-2',
        userId: 'user-1',
        requesterName: '류태호',
        requesterEmail: 'nightowl@example.com',
        taskTitle: '초안 정리',
        message: '초안만 간단히 정리하고 싶어요.',
        participationMode: 'FLEXIBLE',
        status: 'INFO_REQUESTED',
        reviewNote: '실명 확인이 어려워서, 어떤 자리에서 같이 보고 싶은지 조금 더 적어 주세요.',
        preferredSlot: {
          slotKey: '2026-04-15|Body Doubling',
          date: '2026-04-15',
          weekday: '화',
          timeLabel: '21:00 - 22:40',
          focus: 'Body Doubling',
          badgeLabel: 'Tonight',
        },
        scheduledSlot: null,
        createdAt: '2026-04-14T13:00:00',
      },
    ];

    cy.intercept('GET', '**/api/admin-night/calendar*', {
      statusCode: 200,
      body: success([]),
    }).as('calendar');

    cy.intercept('GET', '**/api/admin-night/requests/me', req => {
      req.reply({
        statusCode: 200,
        body: success(myRequests),
      });
    }).as('myRequests');

    cy.intercept('PUT', '**/api/admin-night/requests/request-2/resubmit', req => {
      expect(req.body.requesterName).to.eq('류태호');
      expect(req.body.participationMode).to.eq('OFFLINE');
      expect(req.body.taskTitle).to.contain('실명과 일정');
      expect(req.body.preferredSlot.timeLabel).to.eq('19:00 - 22:00');
      myRequests = [
        {
          id: 'request-2',
          userId: 'user-1',
          requesterName: req.body.requesterName,
          requesterEmail: 'nightowl@example.com',
          taskTitle: req.body.taskTitle,
          message: req.body.message,
          participationMode: req.body.participationMode,
          status: 'PENDING',
          reviewNote: null,
          preferredSlot: req.body.preferredSlot,
          scheduledSlot: null,
          createdAt: '2026-04-14T13:00:00',
        },
      ];
      req.reply({
        statusCode: 200,
        body: success(myRequests[0]),
      });
    }).as('resubmitRequest');

    cy.visit('/admin-night');
    cy.wait(['@calendar', '@myRequests']);
    cy.contains('추가 정보 요청됨').should('be.visible');
    cy.contains('실명 확인이 어려워서').should('be.visible');
    cy.get('[data-cy="admin-night-resubmit-start-request-2"]').click();
    cy.get('[data-cy="admin-night-request-title"]').clear().type('실명과 일정 맥락을 보완한 신청');
    cy.get('[data-cy="admin-night-mode-offline"]').click();
    setRangeValue('[data-cy="admin-night-range-end"]', '1320');
    cy.get('[data-cy="admin-night-range-summary"]').should('contain.text', '19:00 - 22:00');
    cy.get('[data-cy="admin-night-request-message"]')
      .clear()
      .type('오프라인으로 만나서 블로그 초안과 밀린 메일을 같이 끝내고 싶어요.');
    cy.get('[data-cy="admin-night-request-submit"]').click();
    cy.wait('@resubmitRequest');
    cy.wait('@myRequests');
    cy.contains('보완한 신청을 다시 보냈습니다').should('be.visible');
    cy.contains('실명과 일정 맥락을 보완한 신청').should('be.visible');
    cy.contains('대기 중').should('be.visible');
    cy.contains('오프라인').should('be.visible');
  });
});
