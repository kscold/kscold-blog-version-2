import type { Metadata } from 'next';
import { AdminDocumentsSection } from '@/widgets/admin/documents';

export const metadata: Metadata = { title: { absolute: '스토리 관리 | KSCOLD' } };

export default function AdminStoriesPage() {
  return <AdminDocumentsSection space="stories" />;
}
