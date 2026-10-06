import { MessageDeliveryContainer } from '@/widgets/admin/message-delivery';
import { AdminPage, AdminPageHeader } from '@/shared/ui/AdminPage';

export default function AdminMessageDeliveriesPage() {
  return (
    <AdminPage>
      <AdminPageHeader
        eyebrow="Notifications"
        title="알림 발송 로그"
        description="알림톡과 이메일이 누구에게 나갔고 실제로 도착했는지 확인합니다."
      />
      <MessageDeliveryContainer />
    </AdminPage>
  );
}
