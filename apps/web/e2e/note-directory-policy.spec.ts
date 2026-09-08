import { expect, test } from '@playwright/test';
import { loadNoteDirectory } from '../src/widgets/vault/lib/loadNoteDirectory';

test('노트 목록은 사이트맵 기준과 일치하고 주소 없는 예전 문서를 제외한다', async () => {
  const originalFetch = global.fetch;
  global.fetch = async input => Response.json({ data: String(input).includes('sitemap-index')
    ? [{ slug: '백엔드', contentLength: 1500 }, { slug: 'short', contentLength: 1499 },
      { slug: '', contentLength: 5000 }]
    : [{ slug: '백엔드', name: '백엔드 노트' }, { slug: 'short', name: '짧은 노트' },
      { slug: '', name: '주소 없는 예전 노트' }],
  });
  try {
    expect(await loadNoteDirectory()).toEqual([{ slug: '백엔드', name: '백엔드 노트' }]);
  } finally {
    global.fetch = originalFetch;
  }
});

test('필수 제목이 누락되면 부분 목록을 정상 결과로 캐시하지 않는다', async () => {
  const originalFetch = global.fetch;
  global.fetch = async input => Response.json({ data: String(input).includes('sitemap-index')
    ? [{ slug: 'missing-title', contentLength: 1500 }] : [],
  });
  try {
    await expect(loadNoteDirectory()).rejects.toThrow('공개 노트 제목을 찾을 수 없습니다.');
  } finally {
    global.fetch = originalFetch;
  }
});
