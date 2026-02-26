import { VaultNote } from '@/types/api';
import Link from 'next/link';

interface BacklinkListProps {
  backlinks: VaultNote[];
}

export function BacklinkList({ backlinks }: BacklinkListProps) {
  if (!backlinks || backlinks.length === 0) return null;

  return (
    <div className="mt-16 pt-8 border-t border-white/10">
      <h3 className="text-sm font-bold text-surface-400 uppercase tracking-widest mb-6 flex items-center gap-2">
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
          />
        </svg>
        Linked Mentions
      </h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {backlinks.map(note => (
          <Link
            key={note.id}
            href={`/vault/${note.slug}`}
            className="group block p-4 rounded-xl bg-surface-900/50 border border-white/5 hover:border-accent-light/30 hover:bg-surface-800/80 transition-all shadow-sm hover:shadow-[0_0_20px_rgba(100,200,255,0.05)] text-left backdrop-blur-sm relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-accent-light/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <h4 className="text-sm font-bold text-surface-100 group-hover:text-accent-light transition-colors mb-1.5 line-clamp-1 relative z-10">
              {note.title}
            </h4>
            <div className="text-xs text-surface-500 line-clamp-2 relative z-10">
              {/* Very simple markdown stripping for preview */}
              {note.content.replace(/[#*`_\[\]]/g, '').substring(0, 100)}...
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
