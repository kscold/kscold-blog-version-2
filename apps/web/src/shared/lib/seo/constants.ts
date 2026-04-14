export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://kscold.com/api';

export const SITE_URL = 'https://kscold.com';
export const SITE_NAME = '김승찬 블로그';
export const SITE_DESCRIPTION =
  '김승찬의 블로그. 일상과 기술, 작업 기록과 실험을 차곡히 남깁니다.';
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
