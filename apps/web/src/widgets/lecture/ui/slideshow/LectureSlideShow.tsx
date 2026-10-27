'use client';

import dynamic from 'next/dynamic';

// PDF.js는 브라우저에서만 돈다. 서버 렌더에서는 어두운 빈 화면만 내보낸다.
export const LectureSlideShow = dynamic(() => import('./SlideShow'), {
  ssr: false,
  loading: () => <div className="h-dvh bg-surface-950" />,
});
