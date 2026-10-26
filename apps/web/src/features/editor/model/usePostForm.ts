import { useRef, useState } from 'react';
import type { Post } from '@/shared/model/types/blog';
import { suggestPostSlug } from '@/shared/lib/postSlug';
import { createPostForm } from '../lib/postForm';
import type { PostFormData } from './types';

export function usePostForm(post?: Post) {
  // 편집 중 재조회는 form에 적용하지 않는다. 저장 기준은 첫 서버 응답 또는 마지막 저장 결과다.
  const [baseline, setBaseline] = useState(post);
  const [form, setForm] = useState(() => createPostForm(post));
  const [slugUnlocked, setSlugUnlocked] = useState(false);
  const [editorKey, setEditorKey] = useState(0);
  const manualSlug = useRef(Boolean(post));

  function updateField<K extends keyof PostFormData>(key: K, value: PostFormData[K]) {
    setForm(previous => ({ ...previous, [key]: value }));
  }

  function updateTitle(title: string) {
    setForm(previous => ({ ...previous, title,
      ...(!baseline && !manualSlug.current ? { slug: suggestPostSlug(title) } : {}),
    }));
  }

  function updateSlug(slug: string) {
    if (baseline && !slugUnlocked) return;
    manualSlug.current = true;
    updateField('slug', slug);
  }

  function cancelSlugChange() {
    if (baseline) updateField('slug', baseline.slug);
    setSlugUnlocked(false);
  }

  function restore(saved: PostFormData) {
    manualSlug.current = true;
    setForm(previous => baseline ? {
      ...previous, title: saved.title, content: saved.content, excerpt: saved.excerpt,
      coverImage: saved.coverImage, metaTitle: saved.metaTitle,
      metaDescription: saved.metaDescription, keywords: saved.keywords,
    } : { ...saved, status: 'DRAFT', publicOverride: false });
    setEditorKey(key => key + 1);
  }

  function acceptSaved(saved: Post) {
    setBaseline(saved);
    setForm(createPostForm(saved));
    manualSlug.current = true;
    setSlugUnlocked(false);
    setEditorKey(key => key + 1);
  }

  return {
    form, baseline, setForm, updateField, updateTitle, updateSlug, slugUnlocked,
    unlockSlug: () => setSlugUnlocked(true), cancelSlugChange, restore, acceptSaved, editorKey,
    changeSlug: Boolean(baseline && slugUnlocked && form.slug !== baseline.slug),
    dirty: JSON.stringify(form) !== JSON.stringify(createPostForm(baseline)),
    remoteChanged: Boolean(post && baseline && post.updatedAt !== baseline.updatedAt),
  };
}
