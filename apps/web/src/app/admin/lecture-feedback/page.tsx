import { FeedbackResults } from '@/features/lecture-feedback';
import { AdminPage, AdminPageHeader } from '@/shared/ui/AdminPage';

export default function AdminLectureFeedbackPage() {
  return (
    <AdminPage>
      <AdminPageHeader eyebrow="Lecture" title="한살림 강의 설문" description="2026년 10월 21일 교육의 만족도와 자유 의견을 확인합니다." />
      <FeedbackResults />
    </AdminPage>
  );
}
