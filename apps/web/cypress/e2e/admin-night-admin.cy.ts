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

function buildTodaySlot() {
  const now = new Date();
  const date = `${now.getFullYear()}-${`${now.getMonth() + 1}`.padStart(2, '0')}-${`${now.getDate()}`.padStart(2, '0')}`;
  const weekday = new Intl.DateTimeFormat('ko-KR', { weekday: 'short' }).format(now);
  const configByDay = {
    0: { focus: 'Weekend Reset', timeLabel: '14:00 - 16:30', badgeLabel: 'Weekend' },
    1: { focus: 'Inbox Sweep', timeLabel: '20:30 - 22:00', badgeLabel: 'Tonight' },
    2: { focus: 'Body Doubling', timeLabel: '21:00 - 22:40', badgeLabel: 'Tonight' },
    3: { focus: 'PR Window', timeLabel: '21:30 - 23:00', badgeLabel: 'Tonight' },
    4: { focus: 'Inbox Sweep', timeLabel: '20:30 - 22:00', badgeLabel: 'Tonight' },
    5: { focus: 'Body Doubling', timeLabel: '21:00 - 22:40', badgeLabel: 'Tonight' },
    6: { focus: 'Weekend Reset', timeLabel: '14:00 - 16:30', badgeLabel: 'Weekend' },
  } as const;
  const config = configByDay[now.getDay() as keyof typeof configByDay];

  return {
    slotKey: `${date}|${config.focus}`,
    date,
    weekday,
    timeLabel: config.timeLabel,
    focus: config.focus,
    badgeLabel: config.badgeLabel,
  };
}

describe('Admin Night 관리자 승인 시나리오', () => {
  it('시나리오: 관리자는 신청 PR을 승인해 일정으로 merge 할 수 있다', () => {
    seedAdminSession();
    const slot = buildTodaySlot();

    cy.intercept('GET', '**/api/admin/admin-night/requests?status=PENDING', {
      statusCode: 200,
      body: success([
        {
          id: 'request-1',
          userId: 'user-1',
          requesterName: '류태호',
          requesterEmail: 'nightowl@example.com',
          taskTitle: '문서 정리와 메일 답장',
          message: '퇴근 후 밀린 문서를 정리하고 싶어요.',
          participationMode: 'OFFLINE',
          status: 'PENDING',
          preferredSlot: {
            slotKey: slot.slotKey,
            date: slot.date,
            weekday: slot.weekday,
            timeLabel: slot.timeLabel,
            focus: slot.focus,
            badgeLabel: slot.badgeLabel,
          },
          scheduledSlot: null,
          createdAt: '2026-04-14T12:00:00',
        },
      ]),
    }).as('pendingRequests');

    cy.intercept('GET', '**/api/admin/admin-night/requests?status=APPROVED', {
      statusCode: 200,
      body: success([]),
    }).as('approvedRequests');

    cy.intercept('GET', '**/api/admin/admin-night/requests?status=INFO_REQUESTED', {
      statusCode: 200,
      body: success([]),
    }).as('infoRequestedRequests');

    cy.intercept('PUT', '**/api/admin/admin-night/requests/request-1/approve', req => {
      expect(req.body.scheduledSlot.focus).to.exist;
      req.reply({
        statusCode: 200,
        body: success({
          id: 'request-1',
          userId: 'user-1',
          requesterName: '류태호',
          requesterEmail: 'nightowl@example.com',
          taskTitle: '문서 정리와 메일 답장',
          message: '퇴근 후 밀린 문서를 정리하고 싶어요.',
          participationMode: 'OFFLINE',
          status: 'APPROVED',
          preferredSlot: {
            slotKey: slot.slotKey,
            date: slot.date,
            weekday: slot.weekday,
            timeLabel: slot.timeLabel,
            focus: slot.focus,
            badgeLabel: slot.badgeLabel,
          },
          scheduledSlot: req.body.scheduledSlot,
          createdAt: '2026-04-14T12:00:00',
        }),
      });
    }).as('approveRequest');

    cy.visit('/admin/admin-night');
    cy.wait(['@pendingRequests', '@approvedRequests', '@infoRequestedRequests']);
    cy.contains('문서 정리와 메일 답장').should('be.visible');
    cy.contains('오프라인').should('be.visible');
    cy.get('[data-cy="admin-night-approve-request-1"]').click();
    cy.wait('@approveRequest');
  });

  it('시나리오: 관리자는 실명 확인이 어려운 신청에 추가 정보를 요청할 수 있다', () => {
    seedAdminSession();
    const slot = buildTodaySlot();

    cy.intercept('GET', '**/api/admin/admin-night/requests?status=PENDING', {
      statusCode: 200,
      body: success([
        {
          id: 'request-2',
          userId: 'user-2',
          requesterName: '류태호',
          requesterEmail: 'nightowl@example.com',
          taskTitle: '같이 끝내고 싶은 일 정리',
          message: '퇴근 후 밀린 일을 정리하고 싶어요.',
          participationMode: 'FLEXIBLE',
          status: 'PENDING',
          preferredSlot: {
            slotKey: slot.slotKey,
            date: slot.date,
            weekday: slot.weekday,
            timeLabel: slot.timeLabel,
            focus: slot.focus,
            badgeLabel: slot.badgeLabel,
          },
          scheduledSlot: null,
          createdAt: '2026-04-14T12:00:00',
        },
      ]),
    }).as('pendingRequests');

    cy.intercept('GET', '**/api/admin/admin-night/requests?status=APPROVED', {
      statusCode: 200,
      body: success([]),
    }).as('approvedRequests');

    cy.intercept('GET', '**/api/admin/admin-night/requests?status=INFO_REQUESTED', {
      statusCode: 200,
      body: success([]),
    }).as('infoRequestedRequests');

    cy.intercept('PUT', '**/api/admin/admin-night/requests/request-2/request-info', req => {
      expect(req.body.reviewNote).to.contain('실명');
      req.reply({
        statusCode: 200,
        body: success({
          id: 'request-2',
          userId: 'user-2',
          requesterName: '류태호',
          requesterEmail: 'nightowl@example.com',
          taskTitle: '같이 끝내고 싶은 일 정리',
          message: '퇴근 후 밀린 일을 정리하고 싶어요.',
          participationMode: 'FLEXIBLE',
          status: 'INFO_REQUESTED',
          reviewNote: req.body.reviewNote,
          preferredSlot: {
            slotKey: slot.slotKey,
            date: slot.date,
            weekday: slot.weekday,
            timeLabel: slot.timeLabel,
            focus: slot.focus,
            badgeLabel: slot.badgeLabel,
          },
          scheduledSlot: null,
          createdAt: '2026-04-14T12:00:00',
        }),
      });
    }).as('requestMoreInfo');

    cy.visit('/admin/admin-night');
    cy.wait(['@pendingRequests', '@approvedRequests', '@infoRequestedRequests']);
    cy.get('[data-cy="admin-night-review-note-request-2"]').type(
      '실명 확인이 어려워서, 자기소개 링크나 함께 보고 싶은 맥락을 조금 더 남겨주세요.'
    );
    cy.get('[data-cy="admin-night-request-info-request-2"]').click();
    cy.wait('@requestMoreInfo');
  });
});
