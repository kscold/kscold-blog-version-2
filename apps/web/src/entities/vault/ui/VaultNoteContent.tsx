import { VaultNote } from '@/shared/model/types/vault';
import { MarkdownContent } from '@/shared/ui/MarkdownContent';

interface VaultNoteContentProps {
  note: VaultNote;
  theme?: 'light' | 'dark' | 'system';
  titleSlugMap?: Record<string, string>;
}

export function VaultNoteContent({ note, theme = 'light', titleSlugMap = {} }: VaultNoteContentProps) {
  // 옵시디언 마크다운 문법 → 표준 마크다운 변환
  const processContent = (rawContent: string) => {
    let content = rawContent;

    // YAML frontmatter 제거 (노트가 직접 삽입된 경우 대비)
    content = content.replace(/^---[\s\S]*?---\n?/, '');

    // 옵시디언 callout: > [!NOTE] 제목 → > **참고**: 제목
    const calloutTypeMap: Record<string, string> = {
      NOTE: '참고', TIP: '팁', INFO: '정보', IMPORTANT: '중요',
      WARNING: '주의', CAUTION: '주의', DANGER: '위험', BUG: '버그',
      EXAMPLE: '예시', QUOTE: '인용', SUMMARY: '요약', ABSTRACT: '요약',
    };
    content = content.replace(/^> \[!(\w+)\]\+?\s*(.*?)$/gm, (_, type, title) => {
      const label = calloutTypeMap[type.toUpperCase()] ?? type;
      return title.trim() ? `> **[${label}]** ${title.trim()}` : `> **[${label}]**`;
    });

    // ==highlight== → **highlight** (볼드로 대체)
    content = content.replace(/==([^=\n]+)==/g, '**$1**');

    // ![[이미지.ext]] → 이미지 마크다운으로 변환
    content = content.replace(
      /!\[\[([^\]]+\.(png|jpg|jpeg|gif|webp|svg))\]\]/gi,
      (_, filename) => `![${filename}](${filename})`,
    );

    // ![[비이미지 embed]] → 제거
    content = content.replace(/!\[\[([^\]]+)\]\]/g, '');

    // [[link|display]] → [**display**](/vault/slug)
    content = content.replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g, (_, link, display) => {
      const slug = titleSlugMap[link.trim()];
      return slug ? `[**${display}**](/vault/${slug})` : `**${display}**`;
    });

    // [[link]] → [**link**](/vault/slug)
    content = content.replace(/\[\[([^\]]+)\]\]/g, (_, title) => {
      const slug = titleSlugMap[title.trim()];
      return slug ? `[**${title}**](/vault/${slug})` : `**${title}**`;
    });

    return content;
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

  // Tailwind 다크모드 기준으로 실제 테마 계산
  const isDark = theme === 'dark' || (theme === 'system' && typeof document !== 'undefined' && document.documentElement.classList.contains('dark'));
  const actualTheme = isDark ? 'dark' : 'light';

  return (
    <article className="max-w-none">
      <header className="mb-16 relative">
        <div className="absolute -inset-x-6 -inset-y-6 z-0 bg-gradient-to-b from-surface-100 dark:from-surface-900/50 to-transparent blur-2xl opacity-50 pointer-events-none rounded-[3rem]" />

        <div className="relative z-10 flex flex-col gap-6">
          <h1 className="text-4xl sm:text-5xl font-sans font-black tracking-tighter text-surface-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-white dark:via-white dark:to-surface-400">
            {note.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm font-mono text-surface-500 dark:text-surface-400">
            <div className="flex items-center gap-2 bg-white/50 dark:bg-surface-900/50 px-3 py-1.5 rounded-lg border border-surface-200 dark:border-white/5 shadow-sm dark:shadow-[inset_0_1px_rgba(255,255,255,0.05)] backdrop-blur-md">
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
                  className="px-3 py-1 rounded-full bg-surface-100 dark:bg-accent-light/10 text-surface-600 dark:text-accent-light text-xs font-bold border border-surface-200 dark:border-accent-light/20 backdrop-blur-md transition-all cursor-default"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="absolute -bottom-8 left-0 right-0 h-px bg-gradient-to-r from-transparent via-surface-200 dark:via-white/10 to-transparent" />
      </header>

      <div className="mt-8 font-sans">
        <MarkdownContent content={parsedContent} theme={actualTheme} />
      </div>
    </article>
  );
}
