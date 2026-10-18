import Link from 'next/link';
import { HANSALIM_LECTURE } from '../model/hansalimLecture';
import { CopyPageLinkButton } from './CopyPageLinkButton';

export function LectureHeader() {
  const lecture = HANSALIM_LECTURE;

  return (
    <header className="border-b border-surface-200 p-6 sm:p-10 lg:p-12">
      <div className="mb-8 flex items-center justify-between gap-4">
        <Link href="/" className="font-black tracking-tight text-surface-900 print:hidden">
          KSCOLD
        </Link>
        <CopyPageLinkButton />
      </div>
      <p className="mb-4 font-mono text-xs font-bold uppercase tracking-[0.28em] text-primary-600">
        Lecture · {lecture.dateLabel}
      </p>
      <h1 className="max-w-3xl break-keep text-[1.75rem] font-black leading-[1.18] tracking-tight sm:text-4xl lg:text-5xl">
        <span className="block">{lecture.organization}</span>
        <span className="mt-1 block sm:mt-2">{lecture.title}</span>
      </h1>
      <p className="mt-7 max-w-2xl break-keep rounded-2xl border-l-2 border-primary-500 bg-surface-50 p-5 text-base font-bold leading-7 text-surface-800 ring-1 ring-inset ring-surface-200">
        {lecture.firstStep}
      </p>
      <p className="mt-4 text-sm text-surface-500">
        강사 <strong className="text-surface-900">김승찬</strong> · 자료는 로그인 없이 바로 내려받을
        수 있습니다.
      </p>
    </header>
  );
}
