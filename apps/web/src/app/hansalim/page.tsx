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

// 블로그 틀(메뉴·사이드바·푸터) 안에 들어가는 화면이다. GA·방문 기록은 shared/config/standalonePages에서 끈다.
export default function HansalimLecturePage() {
  return (
    <div className="px-4 pb-20 pt-8 text-surface-900 sm:px-6 sm:pt-10 lg:px-8 lg:pt-14 print:p-0">
      <article className="mx-auto max-w-5xl space-y-14 sm:space-y-16">
        <LectureHeader />
        <LectureDownloads />
        <LectureSetupGuide />
        <LectureReviewSection />
        <section
          aria-label="강사 소개"
          className="overflow-hidden rounded-[28px] border border-surface-200 bg-white print:border-0"
        >
          <InstructorProfile />
        </section>
      </article>
    </div>
  );
}
