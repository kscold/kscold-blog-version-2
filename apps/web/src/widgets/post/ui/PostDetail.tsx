import { MarkdownContent } from '@/shared/ui/MarkdownContent';
import { formatPublishedDate } from '@/shared/lib/seo/date';
import type { Post } from '@/shared/model/types/blog';
import { PostCommentSection } from './PostCommentSection';
import { PostHeader } from './PostHeader';
import { RestrictedPostDetail } from './RestrictedPostDetail';

interface PostDetailProps {
  post: Post;
}

export function PostDetail({ post }: PostDetailProps) {
  if (post.restricted) {
    return <RestrictedPostDetail post={post} />;
  }
  if (post.content === null) {
    throw new Error('포스트 본문 응답이 올바르지 않습니다.');
  }

  return (
    <div className="min-h-screen bg-surface-50">
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <PostHeader
          title={post.title}
          coverImage={post.coverImage}
          category={post.category}
          author={post.author}
          views={post.views}
          likes={post.likes}
          featured={post.featured}
          formattedDate={formatPublishedDate(post.publishedAt)}
        />

        <div className="mb-12">
          <MarkdownContent
            content={post.content}
            prioritizeFirstImage
            demotePrimaryHeading
          />
        </div>

        <PostCommentSection tags={post.tags} />
      </article>
    </div>
  );
}
