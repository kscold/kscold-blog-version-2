export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://kscold.com/api';

export const SITE_URL = 'https://kscold.com';
export const SITE_NAME = '김승찬 블로그';
export const SITE_DESCRIPTION =
  '개발자 김승찬(kscold)의 기술 블로그. 백엔드·프론트엔드 개발과 AI 에이전트 실험, 일상의 기록을 남깁니다.';
export const DEFAULT_OG_IMAGE = '/apple-touch-icon.png';

/**
 * 단독 페이지로 색인할 최소 본문 길이(글자 수).
 *
 * 이 값보다 짧은 문서(용어 스텁 등)는 사이트맵에서 제외하고 페이지에도 noindex 를 넣는다.
 * 얇은 페이지가 대량으로 색인되면 사이트 전체 품질 평가에 불리하고 애드센스 정책 위반 사유가 된다.
 * 사이트맵과 페이지가 서로 다른 기준을 쓰면 "색인해달라 + 색인하지 마라" 가 충돌하므로 반드시 이 상수를 공유한다.
 */
export const MIN_INDEXABLE_CONTENT_LENGTH = 500;

export type OpenGraphType =
  | 'website'
  | 'article'
  | 'book'
  | 'profile'
  | 'music.song'
  | 'music.album'
  | 'music.playlist'
  | 'music.radio_station'
  | 'video.movie'
  | 'video.episode'
  | 'video.tv_show'
  | 'video.other';
