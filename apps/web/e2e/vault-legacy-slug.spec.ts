import { expect, test } from '@playwright/test';
import { findCurrentVaultSlug } from '../src/entities/vault';

const titleIndex = [
  { name: 'TypeORM.delete()', slug: 'typeormdelete' },
  { name: 'IIFE(Immediately Invoked Function Expression)', slug: 'iifeimmediately-invoked-function-expression' },
  { name: '접근 제어자(access modifier)', slug: '접근-제어자access-modifier' },
  { name: '접근제어자(access modifier)', slug: '접근제어자access-modifier' },
];

test.describe('Vault 예전 주소 이동', () => {
  test('하이픈만 다른 노트가 하나면 그 노트의 현재 slug를 찾는다', () => {
    expect(findCurrentVaultSlug('typeorm-delete', titleIndex)).toBe('typeormdelete');
    expect(findCurrentVaultSlug('TypeORM-Delete', titleIndex)).toBe('typeormdelete');
    expect(findCurrentVaultSlug('iife-immediately-invoked-function-expression', titleIndex)).toBe(
      'iifeimmediately-invoked-function-expression'
    );
  });

  test('후보가 없거나 둘 이상이면 찾지 않는다', () => {
    expect(findCurrentVaultSlug('insert-2', titleIndex)).toBeUndefined();
    expect(findCurrentVaultSlug('접근제어자accessmodifier', titleIndex)).toBeUndefined();
    expect(findCurrentVaultSlug('---', titleIndex)).toBeUndefined();
  });

  test('한글 단어 앞 4바이트를 16진수로 적은 더 예전 주소도 찾는다', () => {
    const hexIndex = [
      { name: '직렬화(serialization)', slug: '직렬화serialization' },
      { name: '역직렬화 (deserialization)', slug: '역직렬화-deserialization' },
      { name: '정적 메서드(static method)', slug: '정적-메서드static-method' },
      { name: '소스코드의 평가 과정', slug: '소스코드의-평가-과정' },
      { name: '데이터 바인딩', slug: '데이터-바인딩' },
    ];

    expect(findCurrentVaultSlug('eca781eb-serialization', hexIndex)).toBe('직렬화serialization');
    // 겹친 주소에 붙었던 -2는 떼고 찾는다.
    expect(findCurrentVaultSlug('eca095ec-eba994ec-static-method-2', hexIndex)).toBe(
      '정적-메서드static-method'
    );
    expect(findCurrentVaultSlug('ec868cec-ed8f89ea-eab3bcec', hexIndex)).toBe(
      '소스코드의-평가-과정'
    );
    // 한글 단어 수가 다르거나 첫 글자가 다르면 찾지 않는다.
    expect(findCurrentVaultSlug('eb8db0ec', hexIndex)).toBeUndefined();
    expect(findCurrentVaultSlug('ebaaa8eb-serialization', hexIndex)).toBeUndefined();
    expect(findCurrentVaultSlug('deadbeef-serialization', hexIndex)).toBeUndefined();
  });

  test('이미 현재 주소면 다시 보내지 않는다', () => {
    expect(findCurrentVaultSlug('typeormdelete', titleIndex)).toBeUndefined();
  });

  test('예전 주소는 현재 주소로 영구 이동한다', async ({ request }) => {
    // 두 번째 요청은 저장된 응답으로 나가므로, 저장된 뒤에도 이동이 유지되는지 함께 확인한다.
    for (const attempt of [1, 2]) {
      const response = await request.get('/vault/ci-vault-wiki-link', { maxRedirects: 0 });

      expect(response.status(), `요청 ${attempt}`).toBe(308);
      expect(response.headers().location, `요청 ${attempt}`).toBe('/vault/ci-vault-wikilink');
    }

    const followed = await request.get('/vault/ci-vault-wiki-link');
    expect(followed.status()).toBe(200);
    expect(followed.url()).toMatch(/\/vault\/ci-vault-wikilink$/);
  });

  test('한글이 든 주소로 이동할 때 주소를 인코딩한다', async ({ request }) => {
    const response = await request.get(`/vault/${encodeURIComponent('한글주소-노트')}`, {
      maxRedirects: 0,
    });

    expect(response.status()).toBe(308);
    expect(response.headers().location).toBe(`/vault/${encodeURIComponent('한글-주소노트')}`);

    const followed = await request.get(`/vault/${encodeURIComponent('한글주소-노트')}`);
    expect(followed.status()).toBe(200);
    expect(await followed.text()).toContain('CI 한글 주소 노트');
  });

  test('어느 노트인지 정할 수 없거나 없는 주소는 404로 남는다', async ({ request }) => {
    for (const slug of ['ci-twin--note', 'citwinnote', 'ci-no-such-note']) {
      const response = await request.get(`/vault/${slug}`, { maxRedirects: 0 });

      expect(response.status(), slug).toBe(404);
    }
  });
});
