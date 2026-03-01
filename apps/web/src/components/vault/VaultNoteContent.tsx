import { VaultNote } from '@/types/api';
import { MarkdownContent } from '@/components/blog/MarkdownContent';

interface VaultNoteContentProps {
  note: VaultNote;
}

export function VaultNoteContent({ note }: VaultNoteContentProps) {
  // Pre-process Obsidian style backlinks [[Page Title]] to markdown links [Page Title](/vault/page-title)
  const processContent = (rawContent: string) => {
    return rawContent.replace(/\[\[([^\]]+)\]\]/g, (match, title) => {
      // Basic slugification matching the backend SlugUtils (lowercase, replace spaces with hyphens)
      const slug = title
        .toLowerCase()
        .trim()
        .replace(/[\s_]+/g, '-')
        .replace(/[^\w\u3131-\uD79D-]/g, '');
      return `[**${title}**](/vault/${slug})`;
    });
  };

  const parsedContent = processContent(note.content);

  const formattedDate =
    note.updatedAt || note.createdAt
      ? new Date(note.updatedAt || note.createdAt).toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : '';

  return (
    <article className="max-w-none">
      <header className="mb-16 relative">
        <div className="absolute -inset-x-6 -inset-y-6 z-0 bg-gradient-to-b from-surface-900/50 to-transparent blur-2xl opacity-50 pointer-events-none rounded-[3rem]" />

        <div className="relative z-10 flex flex-col gap-6">
          <h1 className="text-4xl sm:text-5xl font-sans font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-surface-400">
            {note.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm font-mono text-surface-400">
            <div className="flex items-center gap-2 bg-surface-900/50 px-3 py-1.5 rounded-lg border border-white/5 shadow-[inset_0_1px_rgba(255,255,255,0.05)] backdrop-blur-md">
              <svg
                className="w-4 h-4 text-accent-light"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{formattedDate}</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {note.tags.map(tag => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full bg-accent-light/10 text-accent-light text-xs font-bold border border-accent-light/20 shadow-[0_0_15px_rgba(100,200,255,0.1)] backdrop-blur-md transition-all hover:bg-accent-light/20 hover:scale-105 cursor-default"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="absolute -bottom-8 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </header>

      <div className="mt-8 font-sans">
        <MarkdownContent content={parsedContent} theme="dark" />
      </div>
    </article>
  );
}
