import type { Metadata } from 'next';
import {
  HANSALIM_DOWNLOADS,
  HANSALIM_LECTURE,
  HANSALIM_RELEASE,
  LectureSlideShow,
  lectureFileHref,
} from '@/widgets/lecture';

const slides = HANSALIM_DOWNLOADS.find(item => item.key === 'pdf');

export const metadata: Metadata = {
  title: `강의 슬라이드 · ${HANSALIM_LECTURE.organization} ${HANSALIM_LECTURE.title}`,
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

// 자료 페이지와 같은 자료 묶음(release)의 수강생용 PDF를 넘겨 본다.
export default function HansalimSlidesPage() {
  if (!slides) return null;
  return (
    <LectureSlideShow
      file={lectureFileHref(slides)}
      fileName={slides.file}
      releaseId={HANSALIM_RELEASE.releaseId}
      title={`${HANSALIM_LECTURE.organization} ${HANSALIM_LECTURE.title}`}
      backHref="/hansalim"
    />
  );
}
