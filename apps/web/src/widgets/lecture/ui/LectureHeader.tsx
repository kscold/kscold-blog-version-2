import Link from 'next/link';
import { Fragment } from 'react';
import { INSTRUCTOR_PROFILE } from '@/entities/profile';
import { HANSALIM_DOWNLOADS } from '../model/hansalimDownloads';
import { HANSALIM_LECTURE } from '../model/hansalimLecture';
import { DownloadLink } from './DownloadLink';

const SLIDES_HREF = '/hansalim/slides';

/**
 * 교육 제목과 실습 자료 받기 버튼. 휴대폰(390×844)과 노트북(1366×768) 첫 화면에 버튼이 보이게 한다.
 * 안내 문장은 상자·굵은 글씨 없이 한 줄로 두고, 압축 풀기 같은 긴 순서는 아래 「실습 준비」에만 쓴다.
 */
export function LectureHeader() {
  const lecture = HANSALIM_LECTURE;
  const lab = HANSALIM_DOWNLOADS.find(item => item.primary && !item.hidden);

  return (
    <header>
      <h1 className="break-keep">
        <span className="block text-base font-bold text-primary-700 sm:text-lg">
          {lecture.organization}
        </span>
        <span className="mt-2 block text-[1.75rem] font-black leading-tight tracking-tight text-surface-900 sm:text-4xl">
          {lecture.title}
        </span>
      </h1>
      <p className="mt-4 text-sm leading-6 text-surface-500 sm:text-base">
        <InfoLine text={`${lecture.dateLabel} · 강사 ${INSTRUCTOR_PROFILE.name}`} />
        <br />
        <InfoLine text={lecture.schedule} />
      </p>

      <p
        data-testid="lecture-intro"
        className="mt-8 break-keep text-base leading-7 text-surface-800 sm:text-lg"
      >
        {lecture.intro}
      </p>
      {lab && (
        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6 sm:gap-y-3">
          <DownloadLink item={lab} variant="primary" testId="lecture-primary-download">
            {lecture.downloadCopy.lab?.action ?? `${lab.format} 받기`}
            <span aria-hidden>↓</span>
          </DownloadLink>
          {/* 휴대폰에서는 버튼 바로 아래에, 넓은 화면에서는 버튼과 링크 줄 다음 줄에 둔다. */}
          <p className="break-keep text-sm text-surface-500 sm:order-last sm:basis-full">
            {lecture.primaryCaption} · {lab.format} {lab.size}
          </p>
          <a
            href="#setup"
            className="inline-flex min-h-11 items-center self-start text-base font-bold text-primary-700 underline underline-offset-4 hover:text-primary-900 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700 sm:self-auto print:hidden"
          >
            준비 방법 보기
          </a>
        </div>
      )}

      <Link
        href={SLIDES_HREF}
        data-testid="lecture-slides-link"
        className="mt-1 inline-flex min-h-11 items-center gap-1 text-base font-bold text-surface-800 sm:mt-5 underline-offset-4 hover:underline focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-surface-900 print:hidden"
      >
        웹에서 강의 보기 <span aria-hidden>→</span>
      </Link>
      <Link href="/hansalim/survey" className="mt-4 flex min-h-14 items-center justify-between gap-4 rounded-2xl border border-primary-200 bg-primary-50 px-5 py-4 text-primary-800 transition-colors hover:bg-primary-100 print:hidden">
        <span><span className="block text-base font-bold">강의 만족도 조사</span><span className="mt-1 block text-sm font-normal">약 2분 · 로그인 없이 의견을 남겨주세요</span></span>
        <span aria-hidden>→</span>
      </Link>
    </header>
  );
}

/** 「 · 」로 나눈 조각은 한 덩어리로 두어, 좁은 화면에서도 「(자율 참여)」처럼 이어진 말이 갈라지지 않게 한다. */
function InfoLine({ text }: { text: string }) {
  return (
    <>
      {text.split(' · ').map((part, index) => (
        <Fragment key={part}>
          {index > 0 && ' · '}
          <span className="whitespace-nowrap">{part}</span>
        </Fragment>
      ))}
    </>
  );
}
