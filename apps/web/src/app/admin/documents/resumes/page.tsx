import type { Metadata } from 'next';
import { AdminDocumentsSection } from '@/widgets/admin/documents';

export const metadata: Metadata = { title: { absolute: '이력서 관리 | KSCOLD' } };

export default function AdminResumesPage() {
  return <AdminDocumentsSection space="resumes" />;
}
