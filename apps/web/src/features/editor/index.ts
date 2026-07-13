// features/editor 슬라이스 퍼블릭 API
export * from './model/types';
export * from './lib/usePostCreate';
export * from './lib/usePostEdit';
export * from './lib/usePostAutosave';
export * from './ui/PostEditor';

// FSD public API 보강
export { usePostCreate } from './lib/usePostCreate';
export { usePostEdit } from './lib/usePostEdit';
export { PostEditor } from './ui/PostEditor';
