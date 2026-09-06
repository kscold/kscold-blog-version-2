import { expect, test } from '@playwright/test';
import { toProfileFeedPage } from '../src/features/profile/lib/profileFeedPage';
import { toProfileLinkPreview } from '../src/features/profile/lib/profileLinkPreview';
import type { PageResponse } from '../src/shared/model/types/api';
import type { Feed } from '../src/shared/model/types/social';

const LINK_URL = 'https://example.com/article?source=profile#details';

test.describe('프로필 피드 전송 데이터 정책', () => {
  test('링크 문구는 상한까지 요약하고 이동 URL은 그대로 보존한다', () => {
    const preview = toProfileLinkPreview({
      url: LINK_URL,
      title: `${'제목'.repeat(100)}TITLE_TAIL`,
      description: `${'설명'.repeat(150)}DESCRIPTION_TAIL`,
      siteName: `${'사이트'.repeat(50)}SITE_NAME_TAIL`,
    });

    expect(preview?.url).toBe(LINK_URL);
    expect(preview?.title?.length).toBeLessThanOrEqual(120);
    expect(preview?.description?.length).toBeLessThanOrEqual(160);
    expect(preview?.siteName?.length).toBeLessThanOrEqual(80);
    expect(preview?.description).toMatch(/\.\.\.$/);
    expect(JSON.stringify(preview)).not.toContain('_TAIL');
  });

  test('짧은 링크 문구와 허용된 외부 이미지는 보존한다', () => {
    const preview = {
      url: LINK_URL,
      title: '참고 자료',
      description: '읽을 수 있는 짧은 설명',
      siteName: 'Example',
      image: 'https://example.com/preview.png',
    };

    expect(toProfileLinkPreview(preview)).toEqual(preview);
  });

  test('다중 코드 유닛 문자가 요약 경계에서 분리되지 않는다', () => {
    const character = String.fromCodePoint(0x1f600);
    const preview = toProfileLinkPreview({
      url: LINK_URL,
      title: `${'가'.repeat(116)}${character}${'나'.repeat(10)}`,
      description: character.repeat(161),
      siteName: character.repeat(80),
    });

    expect(preview?.title).toBe(`${'가'.repeat(116)}${character}...`);
    expect(preview?.description).toBe(`${character.repeat(157)}...`);
    expect(Array.from(preview?.description ?? '')).toHaveLength(160);
    expect(preview?.siteName).toBe(character.repeat(80));
  });

  for (const image of [
    'https://scontent.cdninstagram.com/hidden.png',
    'http://example.com/insecure.png',
    'data:image/png;base64,hidden',
  ]) {
    test(`표시 정책에서 제외한 이미지 주소는 전송하지 않는다: ${image.split(':')[0]}`, () => {
      const preview = toProfileLinkPreview({ url: LINK_URL, title: '참고 자료', image });

      expect(preview?.title).toBe('참고 자료');
      expect(preview?.image).toBeUndefined();
      expect(JSON.stringify(preview)).not.toContain(image);
    });
  }

  test('숨긴 이미지만 있는 링크는 비어 있는 카드로 만들지 않는다', () => {
    expect(
      toProfileLinkPreview({
        url: LINK_URL,
        title: ' ',
        description: '',
        siteName: 'Example',
        image: 'https://cdninstagram.com/hidden.png',
      })
    ).toBeUndefined();
  });

  test('프로필 요약은 원본을 바꾸지 않고 공개 카드의 동작 필드를 유지한다', () => {
    const feed: Feed = {
      id: 'public-feed',
      content: `# 제목\n${'본문'.repeat(300)}RAW_CONTENT_TAIL`,
      images: ['/first.png', '/second.png'],
      tags: ['테스트'],
      author: { id: 'author-id', username: 'author', name: '작성자', avatar: '/avatar.png' },
      visibility: 'PUBLIC',
      linkPreview: { url: LINK_URL, description: '설명'.repeat(200) },
      likesCount: 3,
      commentsCount: 2,
      views: 100,
      isLiked: true,
      createdAt: '2026-09-06T00:00:00Z',
      updatedAt: '2026-09-06T01:00:00Z',
    };
    const original = structuredClone(feed);
    const page: PageResponse<Feed> = {
      content: [feed, { ...feed, id: 'private-feed', visibility: 'PRIVATE' }],
      totalElements: 2, totalPages: 1, size: 12, number: 0,
      first: true, last: true, empty: false,
    };
    const result = toProfileFeedPage(page);

    expect(feed).toEqual(original);
    expect(result.content).toHaveLength(1);
    expect(result.content[0]).toMatchObject({
      id: feed.id, images: feed.images, likesCount: 3, commentsCount: 2, isLiked: true,
    });
    expect(result.content[0].linkPreview?.description?.length).toBeLessThanOrEqual(160);
    expect(JSON.stringify(result)).not.toMatch(/RAW_CONTENT_TAIL|private-feed|author-id|updatedAt|views/);
  });

  test('링크 객체의 알 수 없는 필드를 클라이언트로 복사하지 않는다', () => {
    const preview = { url: LINK_URL, title: '참고 자료', internalField: 'EXTRA_FIELD' };

    expect(JSON.stringify(toProfileLinkPreview(preview))).not.toContain('EXTRA_FIELD');
  });

  for (const [name, unsafeUrl] of [
    ['상한 초과', `https://example.com/${'a'.repeat(2048)}`],
    ['자바스크립트', 'javascript:alert(1)'],
    ['데이터', 'data:text/plain,invalid'],
    ['사용자 정보', 'https://user:password@example.com/image.png'],
    ['로컬 호스트', 'https://localhost/image.png'],
    ['루프백 IPv4', 'https://127.0.0.1/image.png'],
    ['사설 IPv4', 'https://192.168.1.2/image.png'],
    ['사설 IPv6', 'https://[fd00::1]/image.png'],
    ['비허용 포트', 'https://example.com:8080/image.png'],
  ] as const) {
    test(`${name} 이동 주소는 링크 미리보기 전체에서 제외한다`, () => {
      expect(toProfileLinkPreview({ url: unsafeUrl, title: '참고 자료' })).toBeUndefined();
    });

    test(`${name} 이미지 주소는 문구와 이동 주소를 보존하고 제외한다`, () => {
      const preview = toProfileLinkPreview({ url: LINK_URL, title: '참고 자료', image: unsafeUrl });

      expect(preview?.url).toBe(LINK_URL);
      expect(preview?.title).toBe('참고 자료');
      expect(preview?.image).toBeUndefined();
      expect(JSON.stringify(preview)).not.toContain(unsafeUrl);
    });
  }

  test('공개 HTTP 이동 주소와 HTTPS 이미지는 공백을 제거하고 보존한다', () => {
    const preview = toProfileLinkPreview({
      url: '  http://example.com/article  ',
      image: '  https://example.com/image.png  ',
    });

    expect(preview?.url).toBe('http://example.com/article');
    expect(preview?.image).toBe('https://example.com/image.png');
  });

  test('URL 길이 상한에 정확히 맞는 이동 주소와 이미지는 보존한다', () => {
    const prefix = 'https://example.com/';
    const url = `${prefix}${'a'.repeat(2048 - prefix.length)}`;
    const preview = toProfileLinkPreview({ url, image: url });

    expect(preview?.url).toBe(url);
    expect(preview?.image).toBe(url);
  });

  test('최적화 호스트도 HTTPS 기본 포트가 아닌 이미지 주소는 제외한다', () => {
    const preview = toProfileLinkPreview({
      url: LINK_URL,
      title: '참고 자료',
      image: 'https://images.ctfassets.net:80/kftzwdyauwt9/test.png',
    });

    expect(preview?.title).toBe('참고 자료');
    expect(preview?.image).toBeUndefined();
  });

  test('HTTPS 기본 포트를 명시한 이미지는 정상 이미지로 보존한다', () => {
    const image = 'https://images.ctfassets.net:443/kftzwdyauwt9/test.png';

    expect(toProfileLinkPreview({ url: LINK_URL, image })?.image).toBe(image);
  });
});
