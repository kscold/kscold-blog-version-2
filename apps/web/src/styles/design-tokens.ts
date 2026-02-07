/**
 * 김승찬 블로그 v2 디자인 시스템
 * 도도하고 미술관 같은 느낌의 디자인 토큰
 */

export const colors = {
  // 주요 색상 (모노톤 베이스)
  primary: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },

  // 포인트 컬러 (우아한 보라/파랑 계열)
  accent: {
    light: '#a78bfa',
    DEFAULT: '#8b5cf6',
    dark: '#7c3aed',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },

  // 세컨더리 컬러 (따뜻한 뉴트럴, 미술관 느낌)
  secondary: {
    beige: '#f5f1ed',
    sand: '#e8e0d5',
    taupe: '#cabfb1',
  },

  // 시맨틱 컬러
  semantic: {
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },

  // 배경 및 텍스트
  background: {
    light: {
      primary: '#ffffff',
      secondary: '#fafafa',
      tertiary: '#f5f1ed', // 미술관 벽 색
    },
    dark: {
      primary: '#0a0a0a',
      secondary: '#1a1a1a',
      tertiary: '#262626',
    },
  },

  text: {
    light: {
      primary: '#171717',
      secondary: '#525252',
      tertiary: '#a3a3a3',
    },
    dark: {
      primary: '#fafafa',
      secondary: '#a3a3a3',
      tertiary: '#525252',
    },
  },
};

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
  content: '780px', // 블로그 포스트 본문 최적 너비
};

// Glassmorphism 스타일
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

// Anti-Gravity 효과
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

// 애니메이션 이징
export const easing = {
  default: 'cubic-bezier(0.4, 0, 0.2, 1)',
  smooth: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
};

// 애니메이션 지속 시간
export const duration = {
  fast: '150ms',
  normal: '300ms',
  slow: '500ms',
  slower: '800ms',
};

// Border Radius
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

// Z-Index 레이어
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
