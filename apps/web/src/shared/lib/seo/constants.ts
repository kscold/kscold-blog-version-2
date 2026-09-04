export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://kscold.com/api';

export const SITE_URL = 'https://kscold.com';
export const SITE_NAME = '김승찬 블로그';
export const SITE_DESCRIPTION =
  'AI Agent·백엔드·풀스택 개발자 김승찬(kscold)의 기술 블로그. LangGraph·RAG와 Spring Boot·Next.js 기반 서비스의 설계·배포·운영 경험을 기록합니다.';
export const DEFAULT_OG_IMAGE = '/apple-touch-icon.png';

/** 피드 상세와 광고 노출에 필요한 최소 본문 길이(글자 수). */
export const MIN_INDEXABLE_CONTENT_LENGTH = 500;

/** 독립된 지식 문서로 색인할 Vault 노트의 최소 본문 길이(글자 수). */
export const MIN_INDEXABLE_VAULT_CONTENT_LENGTH = 1500;

/** 독립된 목록 페이지로 색인할 태그의 최소 공개 포스트 수. */
export const MIN_INDEXABLE_TAG_POST_COUNT = 3;

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
