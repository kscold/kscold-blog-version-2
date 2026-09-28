import type { Metadata } from 'next';
import { AdminDocumentsSection } from '@/widgets/admin/documents';

export const metadata: Metadata = { title: { absolute: '개인 문서 관리 | KSCOLD' } };

export default function AdminDocumentsPage() {
  return <AdminDocumentsSection />;
}
