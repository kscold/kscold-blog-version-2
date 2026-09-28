import type { Metadata } from 'next';
import { AdminDocumentsSection } from '@/widgets/admin/documents';

export const metadata: Metadata = { title: { absolute: '경력 소스 관리 | KSCOLD' } };

export default function AdminCareerSourcesPage() {
  return <AdminDocumentsSection space="sources" />;
}
