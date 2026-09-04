import { MarkdownContent } from '@/shared/ui/MarkdownContent';
import type { Post } from '@/shared/model/types/blog';
import { PostCommentSection } from './PostCommentSection';
import { PostHeader } from './PostHeader';
import { RestrictedPostDetail } from './RestrictedPostDetail';

interface PostDetailProps {
  post: Post;
}

function formatPublishedDate(publishedAt?: string) {
  return publishedAt
    ? new Date(publishedAt).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';
}

export function PostDetail({ post }: PostDetailProps) {
  if (post.restricted) {
    return <RestrictedPostDetail post={post} />;
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
