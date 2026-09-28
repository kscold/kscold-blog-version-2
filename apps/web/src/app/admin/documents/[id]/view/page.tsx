import type { Metadata } from 'next';
import { AdminDocumentViewerSection } from '@/widgets/admin/documents';

export const metadata: Metadata = { title: { absolute: '비공개 PDF 뷰어 | KSCOLD' } };

export default async function AdminDocumentViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AdminDocumentViewerSection id={id} />;
}
