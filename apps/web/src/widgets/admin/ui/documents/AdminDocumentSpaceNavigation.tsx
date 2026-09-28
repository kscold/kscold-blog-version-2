import { DOCUMENT_SPACES } from '../../lib/adminDocumentSpaces';
import type { AdminDocumentSpace } from '../../model/adminDocumentTypes';

export function AdminDocumentSpaceNavigation({ active }: { active: AdminDocumentSpace }) {
  return (
    <nav aria-label="문서 관리 공간" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {Object.values(DOCUMENT_SPACES).map(space => (
        <a
          key={space.id}
          href={space.href}
          aria-current={space.id === active ? 'page' : undefined}
          data-cy={`admin-document-space-${space.id}`}
          className={`flex min-h-12 items-center justify-center rounded-xl border px-3 py-3 text-center text-sm font-semibold transition-colors ${
            space.id === active
              ? 'border-surface-900 bg-surface-900 text-white'
              : 'border-surface-200 bg-white text-surface-600 hover:border-surface-300 hover:text-surface-900'
          }`}
        >
          {space.navigationLabel}
        </a>
      ))}
    </nav>
  );
}
