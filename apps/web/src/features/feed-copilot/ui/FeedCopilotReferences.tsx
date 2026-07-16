import Link from 'next/link';
import type { FeedCopilotReference } from '../api/feedCopilotApi';

interface FeedCopilotReferencesProps {
  references: FeedCopilotReference[];
  styleReferenceKeys?: string[];
  onToggleStyleReference?: (reference: FeedCopilotReference) => void;
}

export function FeedCopilotReferences({
  references,
  styleReferenceKeys = [],
  onToggleStyleReference,
}: FeedCopilotReferencesProps) {
  if (!references.length) {
    return null;
  }

  const canSelectStyle = Boolean(onToggleStyleReference);

  return (
    <div className="mt-5 border-t border-surface-100 pt-4">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-surface-400">
        {canSelectStyle ? '말투에 참고할 내 기록' : '함께 참고한 내 기록'}
      </p>
      {canSelectStyle ? (
        <p className="mt-1 text-xs leading-5 text-surface-500">
          최대 두 개를 골라 문장 길이와 리듬만 참고합니다. 원문 표현이나 사실을 그대로 가져오지
          않아요.
        </p>
      ) : null}
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {references.map(reference => {
          const referenceKey = `${reference.type}:${reference.id}`;
          const isSelected = styleReferenceKeys.includes(referenceKey);

          if (!canSelectStyle) {
            return (
              <Link
                key={referenceKey}
                href={reference.path || '/'}
                className="group rounded-2xl border border-surface-200 bg-surface-50 px-3 py-3 transition hover:border-surface-300 hover:bg-white"
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="min-w-0 truncate text-sm font-semibold text-surface-800 group-hover:text-surface-950">
                    {reference.title}
                  </span>
                  <span className="shrink-0 text-xs font-medium text-surface-600">열기 →</span>
                </span>
                {reference.excerpt ? (
                  <span className="mt-1 line-clamp-2 block text-xs leading-5 text-surface-500">
                    {reference.excerpt}
                  </span>
                ) : null}
              </Link>
            );
          }

          return (
            <article
              key={referenceKey}
              className={`rounded-2xl border px-3 py-3 transition ${
                isSelected
                  ? 'border-surface-400 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.07)]'
                  : 'border-surface-200 bg-surface-50'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <Link
                  href={reference.path || '/'}
                  className="min-w-0 text-sm font-semibold text-surface-800 transition hover:text-surface-950"
                >
                  <span className="block truncate">{reference.title}</span>
                  <span className="mt-1 block text-xs font-medium text-surface-500">
                    기록 열기 →
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => onToggleStyleReference?.(reference)}
                  aria-pressed={isSelected}
                  className={`shrink-0 rounded-xl px-2.5 py-1.5 text-xs font-bold transition ${
                    isSelected
                      ? 'bg-surface-900 text-white hover:bg-surface-800'
                      : 'border border-surface-200 bg-white text-surface-600 hover:border-surface-400 hover:text-surface-900'
                  }`}
                >
                  {isSelected ? '참고 중' : '글의 결 참고'}
                </button>
              </div>
              {reference.excerpt ? (
                <p className="mt-2 line-clamp-3 text-xs leading-5 text-surface-500">
                  {reference.excerpt}
                </p>
              ) : null}
            </article>
          );
        })}
      </div>
    </div>
  );
}
