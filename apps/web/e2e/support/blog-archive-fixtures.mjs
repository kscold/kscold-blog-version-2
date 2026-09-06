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
