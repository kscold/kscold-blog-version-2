/**
 * 김승찬 블로그 v2 이펙트/레이아웃 토큰
 */

export const glassmorphism = {
  light: {
    background: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  },
  dark: {
    background: 'rgba(26, 26, 26, 0.7)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
  },
};

export const antiGravity = {
  default: {
    boxShadow: {
      light: '0 8px 32px rgba(0, 0, 0, 0.1)',
      dark: '0 8px 32px rgba(0, 0, 0, 0.4)',
    },
  },
  elevated: {
    transform: 'translateY(-4px)',
    boxShadow: {
      light: '0 20px 60px rgba(0, 0, 0, 0.15)',
      dark: '0 20px 60px rgba(0, 0, 0, 0.6)',
    },
  },
  hover: {
    transform: 'translateY(-10px)',
    boxShadow: {
      light: '0 30px 80px rgba(0, 0, 0, 0.2)',
      dark: '0 30px 80px rgba(0, 0, 0, 0.8)',
    },
  },
};

export const easing = {
  default: 'cubic-bezier(0.4, 0, 0.2, 1)',
  smooth: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
};

export const duration = {
  fast: '150ms',
  normal: '300ms',
  slow: '500ms',
  slower: '800ms',
};

export const borderRadius = {
  none: '0',
  sm: '0.125rem',
  DEFAULT: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  '3xl': '1.5rem',
  card: '20px',
  full: '9999px',
};

export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modalBackdrop: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
};
