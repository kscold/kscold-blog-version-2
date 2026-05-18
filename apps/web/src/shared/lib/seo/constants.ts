export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://kscold.com/api';

export const SITE_URL = 'https://kscold.com';
export const SITE_NAME = '김승찬 블로그';
export const SITE_DESCRIPTION =
  '개발자 김승찬(kscold)의 블로그. 백엔드·프론트엔드 기술, 일상과 실험을 기록합니다.';
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
