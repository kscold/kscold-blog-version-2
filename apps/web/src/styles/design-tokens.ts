/**
 * 김승찬 블로그 v2 디자인 시스템
 * 도도하고 미술관 같은 느낌의 디자인 토큰
 */

export { colors } from './colors';
export { glassmorphism, antiGravity, easing, duration, borderRadius, zIndex } from './effects';

export const typography = {
  fontFamily: {
    sans: [
      'var(--font-pretendard)',
      '-apple-system',
      'BlinkMacSystemFont',
      'system-ui',
      'Roboto',
      'sans-serif',
    ].join(', '),
    serif: ['var(--font-playfair)', 'Georgia', 'serif'].join(', '),
    mono: ['var(--font-jetbrains)', 'Fira Code', 'Consolas', 'monospace'].join(', '),
  },

  fontSize: {
    xs: { size: '0.75rem', lineHeight: '1rem' },
    sm: { size: '0.875rem', lineHeight: '1.25rem' },
    base: { size: '1rem', lineHeight: '1.5rem' },
    lg: { size: '1.125rem', lineHeight: '1.75rem' },
    xl: { size: '1.25rem', lineHeight: '1.75rem' },
    '2xl': { size: '1.5rem', lineHeight: '2rem' },
    '3xl': { size: '1.875rem', lineHeight: '2.25rem' },
    '4xl': { size: '2.25rem', lineHeight: '2.5rem' },
    '5xl': { size: '3rem', lineHeight: '1' },
    '6xl': { size: '3.75rem', lineHeight: '1' },
    '7xl': { size: '4.5rem', lineHeight: '1' },
  },

  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
};

export const spacing = {
  0: '0',
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  32: '8rem',
  40: '10rem',
  48: '12rem',
  56: '14rem',
  64: '16rem',
};

export const maxWidth = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
  content: '780px',
};
