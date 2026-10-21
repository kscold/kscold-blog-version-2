import type { Metadata } from 'next';
import Link from 'next/link';
import { LectureFeedbackForm } from '@/features/lecture-feedback';

export const metadata: Metadata = {
  title: '강의 만족도 조사 · 한살림 AI 교육',
  description: '한살림 AI 업무활용 및 개인정보보호 교육에 대한 의견을 남겨주세요.',
  alternates: { canonical: '/hansalim/survey' },
  robots: { index: false, follow: false },
};

export default function HansalimSurveyPage() {
  return (
    <main className="min-h-screen bg-surface-50 px-4 py-8 text-surface-900 sm:px-6 sm:py-14">
      <div className="mx-auto max-w-2xl">
        <Link href="/hansalim" className="inline-flex min-h-11 items-center text-sm font-semibold text-surface-500 hover:text-primary-700">← 강의 자료</Link>
        <header className="mb-10 mt-8">
          <p className="text-sm font-bold tracking-wide text-primary-700">한살림 AI 교육 · 2026.10.21</p>
          <h1 className="mt-4 break-keep text-3xl font-black leading-tight tracking-tight sm:text-4xl">오늘 강의,<br />어떠셨나요?</h1>
          <p className="mt-5 break-keep text-base leading-7 text-surface-600">잘 전달된 점도, 아쉬웠던 점도 듣고 싶어요.<br className="hidden sm:block" /> 다음 강의를 더 알차게 준비할 수 있도록 의견을 남겨주세요.</p>
          <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold text-surface-600">
            <span className="rounded-full border border-surface-200 bg-white px-3 py-1.5">약 2분</span>
            <span className="rounded-full border border-surface-200 bg-white px-3 py-1.5">로그인 없이 참여</span>
            <span className="rounded-full border border-surface-200 bg-white px-3 py-1.5">이름·연락처 수집 없음</span>
          </div>
        </header>
        <LectureFeedbackForm />
        <footer className="mt-12 border-t border-surface-200 pt-6 text-sm text-surface-500">한살림 AI 업무활용 및 개인정보보호 교육 · 김승찬</footer>
      </div>
    </main>
  );
}
