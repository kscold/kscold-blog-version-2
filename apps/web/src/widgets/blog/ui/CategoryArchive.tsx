import { JsonLd } from '@/shared/ui/JsonLd';
import { buildCategoryArchiveJsonLd } from '../lib/categoryArchiveMetadata';
import type { CategoryArchiveData } from '../lib/loadCategoryArchive';
import { CategoryPostContainer } from './CategoryPostContainer';

export function CategoryArchive(archive: CategoryArchiveData) {
  return (
    <>
      <JsonLd
        id={`category-${archive.category.id}-page-${archive.page}`}
        data={buildCategoryArchiveJsonLd(archive)}
      />
      <CategoryPostContainer {...archive} />
    </>
  );
}
