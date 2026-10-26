import { useEffect, useRef, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { Category } from '@/shared/model/types/blog';
import type { PublicationChoice, PublicationState } from '@/entities/post';
import type { PostFormData } from './types';

interface Options {
  form: PostFormData;
  categories?: Category[];
  categoriesError: boolean;
  setForm: Dispatch<SetStateAction<PostFormData>>;
}

export function usePostPublication({ form, categories, categoriesError, setForm }: Options) {
  const category = categories?.find(item => item.id === form.categoryId);
  const [needsReview, setNeedsReview] = useState(false);
  const previousPolicy = useRef<string | null>(null);
  const policy = category && !categoriesError ? `${category.id}:${Boolean(category.restricted)}` : null;

  useEffect(() => {
    if (policy && previousPolicy.current && policy !== previousPolicy.current && form.status === 'PUBLISHED') {
      setNeedsReview(true);
    }
    if (policy) previousPolicy.current = policy;
  }, [policy, form.status]);

  const state: PublicationState = form.status === 'DRAFT' ? 'draft'
    : form.status === 'ARCHIVED' ? 'archived'
    : !policy ? 'unknown'
    : category?.restricted && !form.publicOverride ? 'restricted' : 'public';

  function select(choice: PublicationChoice) {
    if (choice === 'restricted' && (!category?.restricted || categoriesError)) return;
    setForm(previous => ({ ...previous,
      status: choice === 'draft' ? 'DRAFT' : choice === 'archived' ? 'ARCHIVED' : 'PUBLISHED',
      publicOverride: choice === 'restricted' ? false : choice === 'public' && category?.restricted
        ? true : previous.publicOverride,
    }));
    previousPolicy.current = policy;
    setNeedsReview(false);
  }

  function selectCategory(categoryId: string) {
    setForm(previous => ({ ...previous, categoryId }));
    if (form.status === 'PUBLISHED' && form.categoryId !== categoryId) setNeedsReview(true);
  }

  return { category, state, needsReview, select, selectCategory,
    canSave: Boolean(policy && !needsReview),
    error: categoriesError ? '카테고리를 불러오지 못했습니다. 공개 범위를 확인한 뒤 저장해 주세요.'
      : !category ? '카테고리를 선택해 주세요.'
      : needsReview ? '카테고리가 바뀌었습니다. 저장 후 공개 범위를 다시 선택해 주세요.' : null,
  };
}
