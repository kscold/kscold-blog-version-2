import { redirect } from 'next/navigation';
import { isVerifiedAdmin } from '@/shared/lib/server/adminGuard';
import { AdminPage, AdminPageHeader } from '@/shared/ui/AdminPage';
import { SearchInsightsDashboard } from '@/widgets/admin/search-insights/ui/SearchInsightsDashboard';
import { loadSearchInsights } from '@/widgets/admin/search-insights/server/loadSearchInsights';

const PAGE_PATH = '/admin/search';

// 구글 데이터는 서비스 계정 키로 서버에서만 읽는다. 백엔드에서 관리자임을 확인한 뒤에만 부른다.
export default async function AdminSearchPage() {
  if (!(await isVerifiedAdmin())) redirect(`/login?redirect=${encodeURIComponent(PAGE_PATH)}`);
  const insights = await loadSearchInsights();
  return (
    <AdminPage testId="admin-search-page">
      <AdminPageHeader
        eyebrow="Search"
        title="검색 유입"
        description="구글 서치 콘솔, GA4, 색인 상태를 한 화면에서 봅니다."
      />
      <SearchInsightsDashboard insights={insights} />
    </AdminPage>
  );
}
