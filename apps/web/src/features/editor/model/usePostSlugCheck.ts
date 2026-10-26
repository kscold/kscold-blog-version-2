import { useEffect, useState } from 'react';
import { checkPostSlugExists } from '@/entities/post';
import { validatePostSlug } from '@/shared/lib/postSlug';

export function usePostSlugCheck(slug: string, original?: string) {
  const [checked, setChecked] = useState<{ slug: string; error: string | null; pending: boolean } | null>(null);
  const formatError = slug !== original ? validatePostSlug(slug) : null;
  useEffect(() => {
    if (!slug || formatError || slug === original) return;
    let current = true;
    const timer = setTimeout(async () => {
      setChecked({ slug, error: null, pending: true });
      try {
        const exists = await checkPostSlugExists(slug);
        if (current) setChecked({ slug, error: exists ? '이미 사용 중인 글 주소입니다.' : null, pending: false });
      } catch {
        if (current) setChecked({ slug, error: '주소 중복 여부를 확인하지 못했습니다. 저장할 때 다시 확인합니다.', pending: false });
      }
    }, 400);
    return () => { current = false; clearTimeout(timer); };
  }, [slug, original, formatError]);
  return {
    error: formatError || (checked?.slug === slug ? checked.error : null),
    pending: checked?.slug === slug && checked.pending,
  };
}
