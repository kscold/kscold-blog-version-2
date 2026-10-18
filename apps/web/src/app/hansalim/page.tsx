import type { Metadata } from 'next';
import { InstructorProfile } from '@/widgets/info';
import {
  HANSALIM_LECTURE,
  LectureDownloads,
  LectureHeader,
  LectureReviewSection,
  LectureSetupGuide,
} from '@/widgets/lecture';

const pageTitle = `${HANSALIM_LECTURE.organization} ${HANSALIM_LECTURE.title} · ${HANSALIM_LECTURE.dateLabel}`;

// 교육 참가자에게 슬라이드로 안내하는 주소다. 검색 결과에는 내보내지 않는다.
export const metadata: Metadata = {
  title: pageTitle,
  description: `${HANSALIM_LECTURE.organization} ${HANSALIM_LECTURE.title} 실습 자료와 강의 자료를 내려받는 곳입니다.`,
  alternates: { canonical: '/hansalim' },
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default function HansalimLecturePage() {
  return (
    <main className="min-h-screen bg-surface-50 px-4 py-6 text-surface-900 sm:px-6 sm:py-10 print:bg-white print:p-0">
      <article className="mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-surface-200 bg-white shadow-sm print:max-w-none print:rounded-none print:border-0 print:shadow-none">
        <LectureHeader />
        <LectureDownloads />
        <LectureSetupGuide />
        <LectureReviewSection />
        <InstructorProfile />
      </article>
    </main>
  );
}
