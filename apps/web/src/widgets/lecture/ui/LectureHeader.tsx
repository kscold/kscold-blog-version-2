import { HANSALIM_LECTURE } from '../model/hansalimLecture';
import { CopyPageLinkButton } from './CopyPageLinkButton';

export function LectureHeader() {
  const lecture = HANSALIM_LECTURE;

  return (
    <header className="rounded-[28px] border border-surface-200 bg-white p-6 sm:p-8 xl:p-10 print:border-0 print:p-0">
      <p className="text-[11px] font-black uppercase tracking-[0.28em] text-primary-600">
        Lecture · {lecture.dateLabel}
      </p>
      <h1 className="mt-4 max-w-3xl break-keep text-[1.75rem] font-black leading-[1.18] tracking-tight sm:text-4xl xl:text-5xl">
        <span className="block">{lecture.organization}</span>
        <span className="mt-1 block sm:mt-2">{lecture.title}</span>
      </h1>
      <p className="mt-7 max-w-2xl break-keep rounded-2xl border-l-2 border-primary-500 bg-surface-50 p-5 text-base font-bold leading-7 text-surface-800 ring-1 ring-inset ring-surface-200">
        {lecture.firstStep}
        <a
          href="#setup"
          className="mt-2 block text-sm font-bold text-primary-700 underline underline-offset-4 print:hidden"
        >
          Windows·Mac 순서 보기
        </a>
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="break-keep text-sm text-surface-500">
          강사 <strong className="text-surface-900">김승찬</strong> · 로그인하지 않아도 바로 받을 수
          있습니다.
        </p>
        <CopyPageLinkButton />
      </div>
    </header>
  );
}
