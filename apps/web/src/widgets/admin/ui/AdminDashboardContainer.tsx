'use client';

import { useQuery } from '@tanstack/react-query';
import { useCategories } from '@/entities/category';
import { fetchChatRooms } from '@/entities/chat';
import { useFeeds } from '@/entities/feed';
import { useAdminPosts } from '@/entities/post';
import { useTags } from '@/entities/tag';
import { useViewer } from '@/entities/user';
import { useAllVaultNotes } from '@/entities/vault';
import { AdminActionLink, AdminPage, AdminPageHeader } from '@/shared/ui/AdminPage';
import { AdminPageVisitSection } from './analytics/AdminPageVisitSection';
import { AdminUserStatsSection } from './analytics/AdminUserStatsSection';
import { DashboardAttention } from './dashboard/DashboardAttention';
import { DashboardRecentPosts } from './dashboard/DashboardRecentPosts';
import { DashboardShortcuts } from './dashboard/DashboardShortcuts';
import { DashboardStatGrid } from './dashboard/DashboardStatGrid';

const SECTION_TITLE = 'text-lg font-black text-surface-900';

export function AdminDashboardContainer() {
  const { user, role } = useViewer();
  const { data: postsData } = useAdminPosts(0, 5);
  const { data: allPostsData } = useAdminPosts(0, 1);
  const { data: categories } = useCategories();
  const { data: feedsData } = useFeeds({ page: 0, size: 1 });
  const { data: vaultData } = useAllVaultNotes(0, 1);
  const { data: tagsData } = useTags();
  const { data: chatRooms } = useQuery({
    queryKey: ['admin', 'chat', 'rooms'],
    queryFn: fetchChatRooms,
    refetchInterval: 30000,
  });

  const viewerName =
    user?.displayName ||
    user?.username ||
    (role === 'ADMIN' ? '관리자' : role === 'USER' ? '회원' : '');

  const stats = [
    { name: '전체 포스트', value: allPostsData?.totalElements || 0, link: '/admin/posts' },
    { name: '카테고리', value: categories?.length || 0, link: '/admin/categories' },
    { name: '피드', value: feedsData?.totalElements || 0, link: '/admin/feed' },
    { name: 'Vault 노트', value: vaultData?.totalElements || 0, link: '/admin/vault' },
    { name: '태그', value: tagsData?.length || 0, link: '/admin/tags' },
    { name: '채팅 방', value: chatRooms?.length || 0, link: '/admin/chat' },
    {
      name: '총 메시지',
      value: chatRooms?.reduce((sum, room) => sum + room.messageCount, 0) || 0,
      link: '/admin/chat',
    },
  ];

  return (
    <AdminPage width="wide">
      <AdminPageHeader
        eyebrow="Dashboard"
        title="관리자 대시보드"
        description={
          viewerName
            ? `${viewerName}님, 확인이 필요한 일부터 살펴보세요.`
            : '확인이 필요한 일부터 살펴보세요.'
        }
        actions={
          <>
            <AdminActionLink href="/admin/posts/new">새 포스트</AdminActionLink>
            <AdminActionLink href="/admin/feed/new" variant="secondary">
              새 피드
            </AdminActionLink>
            <AdminActionLink href="/admin/vault/new" variant="secondary">
              새 노트
            </AdminActionLink>
          </>
        }
      />

      <DashboardAttention />
      <DashboardStatGrid stats={stats} />
      <DashboardRecentPosts posts={postsData?.content || []} />
      <DashboardShortcuts />

      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className={SECTION_TITLE}>가입자 현황</h2>
          <p className="text-sm leading-6 text-surface-500">
            최근 가입 흐름과 신규 사용자 목록을 한눈에 확인할 수 있습니다.
          </p>
        </div>
        <AdminUserStatsSection />
      </section>

      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className={SECTION_TITLE}>페이지 방문 추이</h2>
          <p className="text-sm leading-6 text-surface-500">
            방문자들이 어떤 페이지를 보는지 일별, 페이지별로 집계합니다.
          </p>
        </div>
        <AdminPageVisitSection />
      </section>
    </AdminPage>
  );
}
