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
    <article className="prose prose-invert max-w-none prose-headings:font-black prose-headings:tracking-tight prose-a:text-accent-light hover:prose-a:text-accent-light/80 prose-a:no-underline">
      <header className="mb-12 border-b border-white/10 pb-8">
        <h1 className="text-4xl sm:text-5xl font-sans font-black tracking-tighter text-white mb-6">
          {note.title}
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-sm font-mono text-surface-400">
          <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-md border border-white/10">
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
                className="px-2 py-0.5 rounded-full bg-accent-light/10 text-accent-light text-xs font-bold border border-accent-light/20 shadow-[0_0_10px_rgba(100,200,255,0.1)] backdrop-blur-sm"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </header>

      <div className="text-surface-300">
        <MarkdownContent content={parsedContent} />
      </div>
    </article>
  );
}
