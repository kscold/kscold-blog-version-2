export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://kscold.com/api';

export const SITE_URL = 'https://kscold.com';
export const SITE_NAME = '김승찬 블로그';
export const SITE_DESCRIPTION =
  '콜딩(Colding)에서 제품을 만들고 운영하는 김승찬의 개인 기술 블로그. 개발 기록, 실험, 피드, Vault 노트를 연결합니다.';
export const DEFAULT_OG_IMAGE = '/apple-touch-icon.png';

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
