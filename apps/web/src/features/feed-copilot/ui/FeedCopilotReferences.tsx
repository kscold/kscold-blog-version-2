import Link from 'next/link';
import type { FeedCopilotReference } from '../api/feedCopilotApi';

interface FeedCopilotReferencesProps {
  references: FeedCopilotReference[];
}

export function FeedCopilotReferences({ references }: FeedCopilotReferencesProps) {
  if (!references.length) {
    return null;
  }

  return (
    <div className="mt-5 border-t border-surface-100 pt-4">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-surface-400">
        함께 참고한 내 기록
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {references.map(reference => (
          <Link
            key={`${reference.type}-${reference.id}`}
            href={reference.path || '/'}
            className="group rounded-2xl border border-surface-200 bg-surface-50 px-3 py-3 transition hover:border-sky-200 hover:bg-sky-50"
          >
            <span className="flex items-center justify-between gap-3">
              <span className="min-w-0 truncate text-sm font-semibold text-surface-800 group-hover:text-sky-800">
                {reference.title}
              </span>
              <span className="shrink-0 text-xs font-medium text-sky-600">열기 →</span>
            </span>
            {reference.excerpt ? (
              <span className="mt-1 line-clamp-2 block text-xs leading-5 text-surface-500">
                {reference.excerpt}
              </span>
            ) : null}
          </Link>
        ))}
      </div>
    </div>
  );
}
