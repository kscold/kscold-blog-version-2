import type { Page, Request } from '@playwright/test';
import { failure, success } from './api';

export interface MockPrivateDocument {
  id: string;
  title: string;
  fileName: string;
  description: string;
  category: 'RESUME' | 'CAREER' | 'STORY' | 'PERSONAL' | 'OTHER';
  size: number;
  contentType: string;
  createdAt: string;
  updatedAt: string;
}

export function privateDocument(overrides: Partial<MockPrivateDocument> = {}): MockPrivateDocument {
  return {
    id: 'doc-1',
    title: '2026 이력서',
    fileName: 'career.pdf',
    description: '이력서 최종본',
    category: 'RESUME',
    size: 5120,
    contentType: 'application/pdf',
    createdAt: '2026-09-28T01:00:00Z',
    updatedAt: '2026-09-28T01:00:00Z',
    ...overrides,
  };
}

interface MockDocumentOptions {
  documents?: MockPrivateDocument[];
  failNames?: string[];
  onRequest?: (request: Request) => void;
}

export async function mockPrivateDocuments(page: Page, options: MockDocumentOptions = {}) {
  let documents = [...(options.documents ?? [])];
  await page.route('**/api/admin/documents**', async route => {
    const request = route.request();
    options.onRequest?.(request);
    const url = new URL(request.url());
    const method = request.method();
    const id = url.pathname.split('/')[4];
    if (url.pathname.endsWith('/download')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/pdf',
        headers: {
          'content-disposition': 'attachment; filename="career.pdf"',
          'cache-control': 'no-store',
          'x-content-type-options': 'nosniff',
        },
        body: '%PDF-1.4\nprivate test document',
      });
      return;
    }
    if (method === 'POST') {
      const body = request.postData() ?? '';
      const name = body.match(/filename="([^"]+)"/)?.[1] ?? 'uploaded.pdf';
      if (options.failNames?.includes(name)) {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify(failure('테스트 업로드 실패')),
        });
        return;
      }
      const category = body.match(/name="category"\r\n\r\n([^\r]+)/)?.[1] as
        MockPrivateDocument['category'] | undefined;
      const uploaded = privateDocument({
        id: `uploaded-${documents.length + 1}`,
        title: name,
        fileName: name,
        category: category ?? 'RESUME',
        description: '',
      });
      documents.unshift(uploaded);
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(success(uploaded)),
      });
      return;
    }
    if (method === 'PUT') {
      const details = request.postDataJSON() as Pick<
        MockPrivateDocument,
        'title' | 'category' | 'description'
      >;
      documents = documents.map(document =>
        document.id === id
          ? { ...document, ...details, updatedAt: '2026-09-28T02:00:00Z' }
          : document
      );
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(success(documents.find(document => document.id === id))),
      });
      return;
    }
    if (method === 'DELETE') {
      documents = documents.filter(document => document.id !== id);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(success(null)),
      });
      return;
    }
    if (method === 'GET' && id) {
      const document = documents.find(item => item.id === id);
      await route.fulfill({
        status: document ? 200 : 404,
        contentType: 'application/json',
        body: JSON.stringify(document ? success(document) : failure('문서를 찾을 수 없습니다.')),
      });
      return;
    }
    const query = (url.searchParams.get('query') ?? '').toLocaleLowerCase();
    const category = url.searchParams.get('category');
    const pageNumber = Number(url.searchParams.get('page') ?? 0);
    const size = Number(url.searchParams.get('size') ?? 12);
    const filtered = documents.filter(
      document =>
        (!category || document.category === category) &&
        `${document.title} ${document.fileName} ${document.description}`
          .toLocaleLowerCase()
          .includes(query)
    );
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(
        success({
          content: filtered.slice(pageNumber * size, (pageNumber + 1) * size),
          number: pageNumber,
          size,
          totalPages: Math.ceil(filtered.length / size),
          totalElements: filtered.length,
        })
      ),
    });
  });
}
