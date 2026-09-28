import type { Page, Request } from '@playwright/test';
import { mockPrivateDocuments, privateDocument, type MockPrivateDocument } from './adminDocuments';
import { createPdfEncryption } from './pdfEncryption';

export const PRIVATE_PDF_TEXT = 'Private viewer sample';
export const PRIVATE_PDF_TITLE = '비공개 PDF 뷰어 검증 자료';

function createPageObjects(pageCount: number, encryption?: ReturnType<typeof createPdfEncryption>): string[] {
  const pageReferences = Array.from({ length: pageCount }, (_, index) => `${4 + index * 2} 0 R`);
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    `<< /Type /Pages /Kids [${pageReferences.join(' ')}] /Count ${pageCount} >>`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];
  for (let number = 1; number <= pageCount; number += 1) {
    const plainStream = `BT /F1 22 Tf 50 720 Td (${PRIVATE_PDF_TEXT} page ${number}) Tj ET\n`;
    const streamReference = 5 + (number - 1) * 2;
    const stream = encryption?.encryptStream(plainStream, streamReference) ?? plainStream;
    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R >> >> /Contents ${streamReference} 0 R >>`,
      `<< /Length ${Buffer.byteLength(stream, 'latin1')} >>\nstream\n${stream}endstream`
    );
  }
  return objects;
}

/** 개인정보와 바이너리 파일 없이 실제 PDF 파서로 읽을 수 있는 테스트 문서를 만든다. */
export function createPrivatePdf(pageCount = 3, password?: string): Buffer {
  const encryption = password ? createPdfEncryption(password) : undefined;
  const objects = createPageObjects(pageCount, encryption);
  const encryptionReference = objects.length + 1;
  if (encryption) objects.push(encryption.dictionary);
  let source = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(source, 'latin1'));
    source += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = Buffer.byteLength(source, 'latin1');
  source += `xref\n0 ${offsets.length}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach(offset => {
    source += `${offset.toString().padStart(10, '0')} 00000 n \n`;
  });
  const encryptedTrailer = encryption ? `/Encrypt ${encryptionReference} 0 R ${encryption.trailerId}` : '';
  source += `trailer\n<< /Size ${offsets.length} /Root 1 0 R ${encryptedTrailer} >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  return Buffer.from(source, 'latin1');
}

/** 시스템 글꼴로 만든 한글 테스트 자료만 사용하고 실제 경력 파일은 열지 않는다. */
export async function createKoreanPrivatePdf(page: Page): Promise<Buffer> {
  const printer = await page.context().newPage();
  try {
    await printer.setContent(`<!doctype html>
      <html lang="ko"><head><meta charset="UTF-8" />
      <style>
        body { font-family: system-ui, -apple-system, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif; padding: 32px; }
        h1 { font-size: 28px; } p { font-size: 16px; line-height: 1.8; }
      </style></head><body>
        <h1>김승찬 경력 문서 — PDF 뷰어 검증용 샘플</h1>
        <p>실측 근거와 프로젝트 기록을 관리하는 테스트 자료입니다.</p>
        <p>AI Agent · LangGraph · Python · Spring Boot</p>
        <p>이 문서에는 실제 경력 수치나 개인 이력서 원문이 없습니다.</p>
      </body></html>`);
    return await printer.pdf({ format: 'A4', printBackground: true });
  } finally {
    await printer.close();
  }
}

interface PdfMockOptions {
  pageCount?: number;
  document?: Partial<MockPrivateDocument>;
  buffer?: Buffer;
  onRequest?: (request: Request) => void;
  failDownloadOnce?: boolean;
}

export async function mockPrivatePdf(page: Page, options: PdfMockOptions = {}) {
  const buffer = options.buffer ?? createPrivatePdf(options.pageCount);
  const document = privateDocument({
    title: PRIVATE_PDF_TITLE,
    fileName: 'private-viewer-test.pdf',
    size: buffer.length,
    description: '테스트 전용 비공개 문서 설명',
    ...options.document,
  });
  await mockPrivateDocuments(page, { documents: [document], onRequest: options.onRequest });
  let downloadCount = 0;
  await page.route(`**/api/admin/documents/${document.id}/download`, async route => {
    options.onRequest?.(route.request());
    downloadCount += 1;
    if (options.failDownloadOnce && downloadCount === 1) {
      await route.fulfill({ status: 503, contentType: 'application/json', body: '{"success":false}' });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/octet-stream',
      headers: {
        'content-disposition': 'attachment; filename="private-viewer-test.pdf"',
        'cache-control': 'no-store',
        'x-content-type-options': 'nosniff',
      },
      body: buffer,
    });
  });
  return document;
}
