import { DOCUMENT_CATEGORIES } from '../../lib/adminDocuments';
import type { AdminDocumentCategory } from '../../model/adminDocumentTypes';

interface DocumentCategorySelectProps {
  id: string;
  value: AdminDocumentCategory | '';
  onChange: (value: AdminDocumentCategory | '') => void;
  allowAll?: boolean;
  disabled?: boolean;
  label?: string;
}

export function DocumentCategorySelect({
  id,
  value,
  onChange,
  allowAll,
  disabled,
  label = '분류',
}: DocumentCategorySelectProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-surface-900">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={event => onChange(event.target.value as AdminDocumentCategory | '')}
        disabled={disabled}
        className="w-full rounded-lg border border-surface-200 bg-white px-4 py-3 text-sm text-surface-900 focus:outline-none focus:ring-1 focus:ring-surface-900 disabled:opacity-50"
      >
        {allowAll && <option value="">전체 문서</option>}
        {DOCUMENT_CATEGORIES.map(category => (
          <option key={category.value} value={category.value}>
            {category.label}
          </option>
        ))}
      </select>
    </div>
  );
}
