import { expect, test } from '@playwright/test';
import { suggestPostSlug, validatePostSlug } from '../src/shared/lib/postSlug';
import { getPostPublication, getPostPath } from '../src/entities/post/lib/publication';
import { createPostForm, toPostUpdate } from '../src/features/editor/lib/postForm';
import { readPostAutosave } from '../src/features/editor/lib/postAutosave';

test('새 주소는 영문 제목만 제안하고 한글·혼합 제목은 입력을 요청한다', () => {
  expect(suggestPostSlug('  Next.js & React 19  ')).toBe('next-js-react-19');
  for (const title of ['한글 제목', 'Next.js와 React', 'café', '!!!']) expect(suggestPostSlug(title)).toBe('');
  for (const invalid of ['', '한글', 'Upper', '-slug', 'slug-', 'slug--two', 'a'.repeat(101), 'a/b']) {
    expect(validatePostSlug(invalid)).toBeTruthy();
  }
  expect(validatePostSlug('seo-geo-aeo-only-8-pages-indexed')).toBeNull();
});

test('기존 주소는 명시적 변경 없이 수정 요청에 넣지 않으며 빈 태그는 보낸다', () => {
  const form = { ...createPostForm(), slug: '한글-기존주소', title: '수정된 제목', tagIds: [] };
  expect(toPostUpdate({ form, changeSlug: false })).not.toHaveProperty('slug');
  expect(toPostUpdate({ form, changeSlug: false }).tagIds).toEqual([]);
  expect(toPostUpdate({ form: { ...form, slug: 'new-address' }, changeSlug: true }).slug).toBe('new-address');
});

test('상태 배지는 초안·보관을 우선하고 서버의 제한 판정을 사용한다', () => {
  expect(getPostPublication({ status: 'DRAFT', restricted: true })).toBe('draft');
  expect(getPostPublication({ status: 'ARCHIVED', restricted: false })).toBe('archived');
  expect(getPostPublication({ status: 'PUBLISHED', restricted: true })).toBe('restricted');
  expect(getPostPublication({ status: 'PUBLISHED', restricted: null })).toBe('public');
  expect(getPostPath({ slug: '한글-주소', category: { slug: '개발' } })).toBe('/blog/' + encodeURIComponent('개발') + '/' + encodeURIComponent('한글-주소'));
});

test('임시 보관 복구는 알 수 없는 속성을 버리고 발행 설정을 복구하지 않는다', () => {
  const form = { ...createPostForm(), title: '보관 제목', content: '본문', slug: '한글-주소', status: 'PUBLISHED', publicOverride: true };
  const saved = readPostAutosave(JSON.stringify({ form, savedAt: '2026-10-26T12:00:00Z' }));
  expect(saved?.form.slug).toBe('한글-주소');
  expect(saved?.form.status).toBe('DRAFT');
  expect(saved?.form.publicOverride).toBe(false);
  expect(readPostAutosave(JSON.stringify({ version: 999, form, savedAt: '2026-10-26' }))).toBeNull();
});
