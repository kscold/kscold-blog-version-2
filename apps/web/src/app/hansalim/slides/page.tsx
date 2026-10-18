import type { Metadata } from 'next';
import {
  HANSALIM_DOWNLOADS,
  HANSALIM_LECTURE,
  LectureSlideShow,
  lectureFileHref,
} from '@/widgets/lecture';

const slides = HANSALIM_DOWNLOADS.find(item => item.key === 'pdf');

export const metadata: Metadata = {
  title: `강의 슬라이드 · ${HANSALIM_LECTURE.organization} ${HANSALIM_LECTURE.title}`,
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default function HansalimSlidesPage() {
  if (!slides) return null;
  return (
    <LectureSlideShow
      file={lectureFileHref(slides.file)}
      title={`${HANSALIM_LECTURE.organization} ${HANSALIM_LECTURE.title}`}
      backHref="/hansalim"
    />
  );
}
