'use client';

import { AdminActionLink, AdminPage, AdminPageHeader } from '@/shared/ui/AdminPage';
import { PostsTable } from './PostsTable';
import { useAdminPosts } from '../../api/useAdminPosts';

export function AdminPostsSection() {
  const { posts, totalPages, page, setPage, isLoading, handleDelete } = useAdminPosts();

  return (
    <AdminPage width="wide">
      <AdminPageHeader
        eyebrow="Posts"
        title="포스트 관리"
        description="발행 상태와 작성 흐름을 한곳에서 살펴보고, 새 글 작성이나 Markdown 가져오기를 바로 이어갈 수 있습니다."
        actions={
          <>
            <AdminActionLink href="/admin/posts/import" variant="secondary">
              MD 가져오기
            </AdminActionLink>
            <AdminActionLink href="/admin/posts/new">새 포스트</AdminActionLink>
          </>
        }
      />

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="h-20 animate-pulse rounded-2xl bg-white" />
          ))}
        </div>
      ) : (
        <PostsTable
          posts={posts}
          totalPages={totalPages}
          page={page}
          onPageChange={setPage}
          onDelete={handleDelete}
        />
      )}
    </AdminPage>
  );
}
