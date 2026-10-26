import { useRef, useState } from 'react';
import { checkPostSlugExists, type PublicationState } from '@/entities/post';
import type { Category, Post } from '@/shared/model/types/blog';
import { validatePostSlug } from '@/shared/lib/postSlug';
import type { PostFormData, PostSaveResult, PostSubmission } from './types';

export interface PublicationConfirmation extends PostSubmission {
  category: Category;
  state: PublicationState;
}

interface Options {
  form: PostFormData;
  baseline?: Post;
  changeSlug: boolean;
  category?: Category;
  state: PublicationState;
  publicationError: string | null;
  onSubmit: (input: PostSubmission) => Promise<PostSaveResult>;
  onSaved: (post: Post) => void;
  clearAutosave: () => void;
}

export function usePostSubmission(options: Options) {
  const [confirmation, setConfirmation] = useState<PublicationConfirmation | null>(null);
  const [result, setResult] = useState<PostSaveResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const lock = useRef(false);
  const latest = useRef(options.form);
  latest.current = options.form;

  async function save(input: PostSubmission) {
    try {
      const saved = await options.onSubmit(input);
      setResult(saved);
      options.onSaved(saved.post);
      options.clearAutosave();
      setConfirmation(null);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : '저장에 실패했습니다. 입력한 내용은 유지됩니다.');
      setConfirmation(null);
    }
  }

  async function begin() {
    if (lock.current || result || confirmation) return;
    lock.current = true;
    setBusy(true);
    setAttempted(true);
    setError(null);
    const snapshot = options.form;
    try {
      const invalid = validateSubmission(options);
      if (invalid) {
        setError(invalid.message);
        requestAnimationFrame(() => document.getElementById(invalid.field)?.focus());
        return;
      }
      if (!options.baseline || options.changeSlug) {
        const exists = await checkPostSlugExists(snapshot.slug);
        if (latest.current !== snapshot) return;
        if (exists) { setError('이미 사용 중인 글 주소입니다.'); requestAnimationFrame(() => document.getElementById('post-slug')?.focus()); return; }
      }
      const input = { form: snapshot, changeSlug: options.changeSlug };
      const changedAddress = options.baseline && (options.changeSlug || snapshot.categoryId !== options.baseline.category.id);
      if (snapshot.status === 'PUBLISHED' || options.baseline?.status === 'PUBLISHED' || changedAddress || snapshot.status === 'ARCHIVED') {
        setConfirmation({ ...input, category: options.category!, state: options.state });
      } else await save(input);
    } catch {
      setError('주소 중복 여부를 확인하지 못했습니다. 입력을 유지했으니 다시 시도해 주세요.');
    } finally { lock.current = false; setBusy(false); }
  }

  async function confirm() {
    if (!confirmation || lock.current) return;
    lock.current = true;
    setBusy(true);
    setError(null);
    try { await save(confirmation); } finally { lock.current = false; setBusy(false); }
  }

  return { confirmation, result, error, busy, attempted, begin, confirm,
    cancel: () => { if (!lock.current) setConfirmation(null); },
    continueEditing: () => { setResult(null); setAttempted(false); setError(null); },
  };
}

function validateSubmission({ form, baseline, changeSlug, publicationError }: Options) {
  if (!form.title.trim()) return { field: 'post-title', message: '제목을 입력해 주세요.' };
  if (!form.content.trim()) return { field: 'post-document', message: '본문을 입력해 주세요.' };
  if (publicationError) return { field: 'post-category', message: publicationError };
  const slugError = !baseline || changeSlug ? validatePostSlug(form.slug) : null;
  return slugError ? { field: 'post-slug', message: slugError } : null;
}
