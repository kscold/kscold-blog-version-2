import { JsonLd } from '@/shared/ui/JsonLd';
import { buildTagArchiveJsonLd } from '../lib/tagArchiveMetadata';
import type { TagArchiveData } from '../lib/loadTagArchive';
import { TagPostContainer } from './TagPostContainer';

export function TagArchive(archive: TagArchiveData) {
  return (
    <>
      <JsonLd
        id={`tag-${archive.tag.id}-page-${archive.page}`}
        data={buildTagArchiveJsonLd(archive)}
      />
      <TagPostContainer {...archive} />
    </>
  );
}
