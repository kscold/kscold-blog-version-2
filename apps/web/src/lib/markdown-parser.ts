import matter from 'gray-matter';
import { ParsedMarkdownFile } from '@/types/import';

/**
 * .md 파일을 파싱하여 블로그 포스트 데이터로 변환
 * 옵시디언, 노션 내보내기, 일반 markdown 모두 지원
 */
export function parseMarkdownFile(
  filename: string,
  rawContent: string
): ParsedMarkdownFile {
  const warnings: string[] = [];

  let frontmatter: Record<string, unknown> = {};
  let content: string;

  try {
    const parsed = matter(rawContent);
    frontmatter = parsed.data as Record<string, unknown>;
    content = parsed.content;
  } catch {
    warnings.push('frontmatter 파싱 실패, 전체를 본문으로 처리합니다');
    content = rawContent;
  }

  const title = extractTitle(frontmatter, content, filename);
  const slug = extractSlug(frontmatter, filename, title);
  const tags = extractTags(frontmatter);
  const category = extractCategory(frontmatter);
  const date = extractDate(frontmatter, filename);
  const coverImage = extractCoverImage(frontmatter);
  const excerpt = extractExcerpt(frontmatter, content);
  const cleanContent = cleanMarkdownContent(content, title);

  return {
    filename,
    title,
    slug,
    content: cleanContent,
    excerpt,
    tags,
    category,
    date,
    coverImage,
    status: 'DRAFT',
    rawFrontmatter: frontmatter,
    parseWarnings: warnings,
  };
}

function extractTitle(
  fm: Record<string, unknown>,
  content: string,
  filename: string
): string {
  if (typeof fm.title === 'string' && fm.title.trim()) return fm.title.trim();
  if (typeof fm.Title === 'string' && fm.Title.trim()) return fm.Title.trim();

  // 본문 첫 번째 # 헤딩에서 추출
  const headingMatch = content.match(/^#\s+(.+)$/m);
  if (headingMatch) return headingMatch[1].trim();

  // 파일명에서 추출 (날짜 접두사 제거)
  return filename
    .replace(/\.md$/i, '')
    .replace(/^\d{4}-\d{2}-\d{2}-?/, '')
    .replace(/[-_]/g, ' ')
    .trim();
}

function extractSlug(
  fm: Record<string, unknown>,
  filename: string,
  title: string
): string {
  if (typeof fm.slug === 'string' && fm.slug.trim()) return fm.slug.trim();
  if (typeof fm.permalink === 'string' && fm.permalink.trim()) {
    return fm.permalink.trim().replace(/^\/|\/$/g, '');
  }

  // 제목에서 슬러그 생성
  return title
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .trim();
}

function extractTags(fm: Record<string, unknown>): string[] {
  const raw = fm.tags ?? fm.tag ?? fm.keywords ?? fm.Tags ?? fm.Keywords;
  if (!raw) return [];

  if (Array.isArray(raw)) {
    return raw.map((t) => String(t).trim()).filter(Boolean);
  }

  if (typeof raw === 'string') {
    return raw
      .split(/[,;]/)
      .map((t) => t.trim())
      .filter(Boolean);
  }

  return [];
}

function extractCategory(fm: Record<string, unknown>): string | null {
  const raw = fm.category ?? fm.categories ?? fm.Category ?? fm.folder;
  if (!raw) return null;

  if (Array.isArray(raw)) return raw[0] ? String(raw[0]).trim() : null;
  if (typeof raw === 'string') return raw.trim() || null;

  return null;
}

function extractDate(
  fm: Record<string, unknown>,
  filename: string
): string | null {
  const raw =
    fm.date ?? fm.created ?? fm.createdAt ?? fm.Date ?? fm['Date Created'];
  if (raw) {
    if (raw instanceof Date) return raw.toISOString().split('T')[0];
    const str = String(raw).trim();
    // YYYY-MM-DD 패턴 확인
    const match = str.match(/(\d{4}-\d{2}-\d{2})/);
    if (match) return match[1];
    // 날짜 파싱 시도
    const parsed = new Date(str);
    if (!isNaN(parsed.getTime())) return parsed.toISOString().split('T')[0];
  }

  // 파일명에서 날짜 추출 (2026-02-22-post-title.md)
  const filenameMatch = filename.match(/^(\d{4}-\d{2}-\d{2})/);
  if (filenameMatch) return filenameMatch[1];

  return null;
}

function extractCoverImage(fm: Record<string, unknown>): string | null {
  const raw =
    fm.coverImage ?? fm.cover ?? fm.thumbnail ?? fm.image ?? fm.banner;
  if (typeof raw === 'string' && raw.trim()) return raw.trim();
  return null;
}

function extractExcerpt(
  fm: Record<string, unknown>,
  content: string
): string {
  const raw = fm.excerpt ?? fm.description ?? fm.summary ?? fm.abstract;
  if (typeof raw === 'string' && raw.trim()) return raw.trim();

  // 본문에서 자동 생성 (마크다운 문법 제거, 200자)
  const plain = content
    .replace(/^#.*$/gm, '') // 헤딩 제거
    .replace(/!\[.*?\]\(.*?\)/g, '') // 이미지 제거
    .replace(/\[([^\]]*)\]\(.*?\)/g, '$1') // 링크를 텍스트만
    .replace(/[*_`~>#-]/g, '') // 마크다운 문법 제거
    .replace(/\n+/g, ' ')
    .trim();

  return plain.length <= 200 ? plain : plain.substring(0, 200) + '...';
}

/**
 * 본문에서 제목 헤딩 제거 (중복 방지) + 옵시디언 문법 변환
 */
function cleanMarkdownContent(content: string, title: string): string {
  let cleaned = content;

  // 본문 첫 줄이 제목과 같은 # 헤딩이면 제거
  const firstHeadingMatch = cleaned.match(/^#\s+(.+)\n*/);
  if (firstHeadingMatch && firstHeadingMatch[1].trim() === title) {
    cleaned = cleaned.replace(/^#\s+.+\n*/, '');
  }

  // 옵시디언 [[wikilink|display]] -> [display]
  cleaned = cleaned.replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g, '[$2]');
  // 옵시디언 [[wikilink]] -> [wikilink]
  cleaned = cleaned.replace(/\[\[([^\]]+)\]\]/g, '[$1]');
  // 옵시디언 ==highlight== -> **highlight**
  cleaned = cleaned.replace(/==([^=]+)==/g, '**$1**');
  // 옵시디언 ![[embed]] 제거
  cleaned = cleaned.replace(/!\[\[([^\]]+)\]\]/g, '');

  return cleaned.trim();
}
