import { isIndexableTag } from '@/shared/lib/seo';
import { AdSenseScript } from '@/shared/ui/AdSenseScript';
import { JsonLd } from '@/shared/ui/JsonLd';
import { buildTagArchiveJsonLd } from '../lib/tagArchiveMetadata';
import type { TagArchiveData } from '../lib/loadTagArchive';
import { TagPostContainer } from './TagPostContainer';

export function TagArchive(archive: TagArchiveData) {
  // 글이 몇 개 없는 태그 화면은 색인에서도 빼는 얇은 목록이라 광고를 붙이지 않는다.
  const hasAdworthyContent = isIndexableTag(archive.tag) && archive.initialPosts.content.length > 0;

  return (
    <>
      <JsonLd
        id={`tag-${archive.tag.id}-page-${archive.page}`}
        data={buildTagArchiveJsonLd(archive)}
      />
      {hasAdworthyContent && <AdSenseScript />}
      <TagPostContainer {...archive} />
    </>
  );
}
