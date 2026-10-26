// entities/post 슬라이스 퍼블릭 API
export * from './api/usePosts';
export * from './ui/PostCard';

// FSD public API 보강
export { useCreatePost, useDeletePost, useUpdatePost } from './api/usePostMutations';
export { useAdminPost, useAdminPosts, useFeaturedPosts, usePosts, usePostsByCategory, usePostsByTag, useSearchPosts } from './api/usePosts';
export { PostCard } from './ui/PostCard';
export { PUBLICATION, getPostPublication, getPostPath, getPostViewPath } from './lib/publication';
export type { PublicationState, PublicationChoice } from './lib/publication';
export { checkPostSlugExists } from './api/checkPostSlug';
