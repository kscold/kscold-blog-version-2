// 어드민 스모크 시나리오가 화면을 채우는 데 쓰는 고정 데이터.

export const postPage = {
  content: [
    {
      id: 'post-1',
      title: 'QA 화면 실험 로그',
      slug: 'qa-screen-log',
      category: { id: 'cat-1', name: 'Dev Story', slug: 'dev-story' },
      status: 'PUBLISHED',
      views: 98,
      featured: true,
      createdAt: '2026-04-03T08:00:00Z',
    },
  ],
  totalElements: 6,
  totalPages: 1,
  size: 20,
  number: 0,
  first: true,
  last: true,
  empty: false,
};

export const vaultPage = {
  content: [
    {
      id: 'vault-1',
      title: 'Admin QA Session Notes',
      slug: 'admin-qa-session-notes',
      tags: ['qa', 'admin'],
      views: 120,
      commentsCount: 1,
      createdAt: '2026-04-02T17:00:00Z',
    },
  ],
  totalElements: 14,
  totalPages: 1,
  size: 50,
  number: 0,
  first: true,
  last: true,
  empty: false,
};

export const chatRooms = [
  {
    userId: 'room-1',
    username: 'visitor-alpha',
    online: true,
    lastMessage: '테스트 실행이 보이네요.',
    lastTimestamp: '2026-04-03T08:15:00Z',
    unreadCount: 1,
    messageCount: 3,
    messages: [
      {
        id: 'msg-1',
        content: '테스트 실행이 보이네요.',
        sender: 'VISITOR',
        sentAt: '2026-04-03T08:15:00Z',
      },
    ],
  },
];

export const userStats = {
  totalUsers: 124,
  newUsersToday: 3,
  newUsersThisWeek: 11,
  newUsersThisMonth: 24,
  dailySignups: [
    { date: '04/01', count: 2 },
    { date: '04/02', count: 2 },
    { date: '04/03', count: 3 },
  ],
  recentUsers: [
    {
      id: 'user-1',
      username: 'kscold',
      displayName: '김승찬',
      email: 'developerkscold@gmail.com',
      avatar: null,
      role: 'ADMIN',
      createdAt: '오늘',
    },
  ],
};

export const accessRequests = [
  {
    id: 'req-1',
    userId: 'user-2',
    username: 'reader-one',
    categoryId: 'cat-1',
    categoryName: 'Dev Story',
    status: 'PENDING',
    message: '접근 권한을 확인하고 싶습니다.',
    createdAt: '2026-04-03T08:20:00Z',
  },
];

export const categories = [
  {
    id: 'cat-1',
    name: 'Dev Story',
    slug: 'dev-story',
    description: '개발 경험과 회고',
    parent: null,
    icon: '✦',
    color: '#111827',
    order: 0,
    depth: 0,
    postCount: 12,
  },
];

export const tags = [
  {
    id: 'tag-1',
    name: 'Next.js',
    slug: 'next-js',
    postCount: 7,
    createdAt: '2026-03-20T12:00:00Z',
  },
  {
    id: 'tag-2',
    name: 'Spring Boot',
    slug: 'spring-boot',
    postCount: 4,
    createdAt: '2026-03-18T12:00:00Z',
  },
];

export const dailyVisits = [
  { date: '2026-04-01', visits: 42 },
  { date: '2026-04-02', visits: 57 },
  { date: '2026-04-03', visits: 31 },
];

export const topPaths = [
  { path: '/blog/dev-story/qa-screen-log', visits: 38, uniqueVisitors: 21 },
  { path: '/vault/admin-qa-session-notes', visits: 17, uniqueVisitors: 9 },
];

export const visitHistory = [
  {
    path: '/blog/dev-story/qa-screen-log',
    userId: 'user-2',
    username: 'reader-one',
    visitedAt: '2026-04-03T08:10:00Z',
  },
];
