import { expect, test, type APIRequestContext } from '@playwright/test';

type JsonLdNode = Record<string, unknown> & { '@type'?: string; '@id'?: string };

async function jsonLdNodes(request: APIRequestContext, path: string) {
  const html = await (await request.get(path)).text();
  const nodes: JsonLdNode[] = [];
  for (const [, body] of html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
    const data = JSON.parse(body) as JsonLdNode & { '@graph'?: JsonLdNode[] };
    nodes.push(...(data['@graph'] ?? [data]));
  }
  return { html, nodes };
}

test('홈 첫 제목과 사이트 Person은 블로그 주인 이름을 담는다', async ({ page, request }) => {
  const { nodes } = await jsonLdNodes(request, '/');
  const person = nodes.find(node => node['@type'] === 'Person');
  expect(person?.name).toBe('김승찬');
  expect(person?.alternateName).toEqual(expect.arrayContaining(['kscold', 'Seungchan Kim']));
  expect(person?.sameAs).toEqual(expect.arrayContaining(['https://github.com/kscold']));

  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('김승찬의 기술 블로그');
});

test('소개 페이지는 이름이 먼저 오는 제목과 인물 정보를 담은 ProfilePage를 제공한다', async ({ request }) => {
  const { html, nodes } = await jsonLdNodes(request, '/info');
  expect(html).toMatch(/<title>김승찬\(kscold\) - AI Agent·풀스택 개발자 소개/);
  const description = html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? '';
  expect(description).toContain('김승찬');
  // 괄호가 걷혀 "김승찬 kscold ." 처럼 끊긴 문장이 나오지 않아야 한다.
  expect(description).not.toMatch(/\s\.\s/);

  const profile = nodes.find(node => node['@type'] === 'ProfilePage');
  const person = profile?.mainEntity as JsonLdNode | undefined;
  expect(person?.['@type']).toBe('Person');
  expect(person?.['@id']).toBe('https://kscold.com/#person');
  expect(person?.name).toBe('김승찬');
  expect(person?.image).toBeTruthy();
  expect(person?.sameAs).toEqual(expect.arrayContaining(['https://github.com/kscold']));
});
