const baseProfile = {
  bio: 'CI 빌드 검증용 공개 프로필',
  socialLinks: {},
  techStack: ['Spring Boot', 'Next.js', 'Python', 'LangGraph'],
};

export const publicProfile = {
  ...baseProfile,
  id: 'ci-profile',
  username: 'kscold',
  displayName: '김승찬',
};

const fallbackProfiles = [
  ['ci-feed-failure', 'CI 피드 장애 프로필'],
  ['ci-feed-not-found', 'CI 피드 없음 프로필'],
  ['ci-feed-invalid', 'CI 피드 형식 오류 프로필'],
  ['ci-feed-slow', 'CI 피드 지연 프로필'],
].map(([username, displayName]) => ({
  ...baseProfile,
  id: `${username}-profile`,
  username,
  displayName,
}));

const publicProfiles = new Map([
  [publicProfile.username, publicProfile],
  ...fallbackProfiles.map(profile => [profile.username, profile]),
]);

export function getPublicProfileFixture(username) {
  return publicProfiles.get(username) ?? null;
}

function createProfileFeed({ id, content, createdAt, visibility = 'PUBLIC', tags = [] }) {
  return {
    id,
    content,
    images: [],
    tags,
    author: {
      id: publicProfile.id,
      username: publicProfile.username,
      name: publicProfile.displayName,
    },
    visibility,
    likesCount: id === 'ci-indexable-feed' ? 1 : 0,
    commentsCount: id === 'ci-indexable-feed' ? 2 : 0,
    views: id === 'ci-indexable-feed' ? 3 : 0,
    isLiked: false,
    createdAt,
    updatedAt: createdAt,
  };
}

const firstPageFeeds = [
  createProfileFeed({
    id: 'ci-indexable-feed',
    content: `# ${'긴 검색 노출 제목 '.repeat(30)}PROFILE_FEED_HEADING_TAIL\n${'가'.repeat(520)} PROFILE_FEED_RAW_TAIL`,
    tags: ['CI'],
    createdAt: '2026-01-03T00:00:00Z',
  }),
  createProfileFeed({
    id: 'ci-short-feed',
    content: '검색 색인 기준보다 짧지만 공개 프로필에는 표시되는 피드입니다.',
    createdAt: '2026-01-02T00:00:00Z',
  }),
  createProfileFeed({
    id: 'ci-private-feed',
    content: '비공개 피드 '.repeat(60),
    visibility: 'PRIVATE',
    createdAt: '2026-01-01T00:00:00Z',
  }),
];

const secondPageFeeds = [
  createProfileFeed({
    id: 'ci-second-page-feed',
    content: '클라이언트 페이지네이션 검증용 두 번째 페이지 피드입니다.',
    createdAt: '2025-12-31T00:00:00Z',
  }),
];

function createProfileFeedPage(content, number) {
  return {
    content,
    number,
    size: 12,
    totalElements: firstPageFeeds.length + secondPageFeeds.length,
    totalPages: 2,
    first: number === 0,
    last: number === 1,
    empty: content.length === 0,
  };
}

export function getProfileFeedPage(pageNumber) {
  return pageNumber === 1
    ? createProfileFeedPage(secondPageFeeds, 1)
    : createProfileFeedPage(firstPageFeeds, 0);
}

export const emptyProfileFeedPage = {
  content: [],
  number: 0,
  size: 12,
  totalElements: 0,
  totalPages: 0,
  first: true,
  last: true,
  empty: true,
};

export const invalidProfileFeedPage = {
  content: '올바르지 않은 목록',
  totalPages: -1,
};

export const PROFILE_FEED_SLOW_DELAY_MS = 4_000;
