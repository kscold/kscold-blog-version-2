export const blogArchiveCategory = {
  id: 'ci-category',
  name: 'Engineering',
  slug: 'engineering',
  ancestors: [],
  depth: 0,
  order: 0,
  postCount: 120,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

export const categoryArchiveCategory = {
  id: 'ci-dev-story-category',
  name: 'Dev Story',
  slug: 'dev-story',
  description: 'CI 카테고리 페이지네이션 검증',
  ancestors: [],
  depth: 0,
  order: 1,
  postCount: 16,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

export const tagArchiveTag = {
  id: 'ci-public-tag',
  name: 'Public',
  slug: 'public',
  categoryId: categoryArchiveCategory.id,
  categoryName: categoryArchiveCategory.name,
  postCount: 19,
  publicPostCount: 19,
  feedCount: 0,
  totalCount: 19,
  unregistered: false,
};

export function getBlogArchivePage(featuredPost, searchParams) {
  const number = Number(searchParams.get('page') || 0);
  const size = Number(searchParams.get('size') || 12);
  const posts =
    process.env.BUILD_BLOG_EMPTY === 'true'
      ? []
      : [
          featuredPost,
          ...Array.from({ length: 119 }, (_, index) => ({
            ...featuredPost,
            id: `ci-archive-${index + 2}`,
            title: `CI 아카이브 ${index + 2} 글`,
            slug: `ci-archive-${index + 2}`,
            featured: false,
          })),
        ];
  const content = posts.slice(number * size, (number + 1) * size);
  const totalPages = Math.ceil(posts.length / size);
  return {
    content,
    number,
    size,
    totalPages,
    totalElements: posts.length,
    first: number === 0,
    last: number + 1 >= totalPages,
    empty: content.length === 0,
  };
}

export function getCategoryArchivePage(featuredPost, searchParams) {
  return getScopedArchivePage(featuredPost, searchParams, {
    count: 16,
    prefix: 'CI dev-story',
    category: categoryArchiveCategory,
    tag: featuredPost.tags[0],
  });
}

export function getTagArchivePage(featuredPost, searchParams) {
  return getScopedArchivePage(featuredPost, searchParams, {
    count: 19,
    prefix: 'CI public',
    category: categoryArchiveCategory,
    tag: tagArchiveTag,
  });
}

function getScopedArchivePage(featuredPost, searchParams, fixture) {
  const number = Number(searchParams.get('page') || 0);
  const size = Number(searchParams.get('size') || 12);
  const posts = Array.from({ length: fixture.count }, (_, index) => ({
    ...featuredPost,
    id: `${fixture.prefix}-${index + 1}`,
    title: `${fixture.prefix} ${index + 1} 글`,
    slug: `${fixture.prefix.toLowerCase().replaceAll(' ', '-')}-${index + 1}`,
    category: fixture.category,
    tags: [fixture.tag],
    featured: false,
  }));
  const content = posts.slice(number * size, (number + 1) * size);
  const totalPages = Math.ceil(posts.length / size);
  return {
    content,
    number,
    size,
    totalPages,
    totalElements: posts.length,
    first: number === 0,
    last: number + 1 >= totalPages,
    empty: content.length === 0,
  };
}
