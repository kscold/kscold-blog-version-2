import {
  HANSALIM_DOWNLOADS,
  HANSALIM_RELEASE,
  type HansalimDownload,
} from '../model/hansalimDownloads';
import { HANSALIM_LECTURE } from '../model/hansalimLecture';
import { DownloadLink } from './DownloadLink';
import { GuideText } from './GuideText';
import { LectureSectionHeading } from './LectureSectionHeading';

// 슬라이드 수는 PDF와 PPT에 함께 적용된다(강의 저장소의 검사 도구도 두 파일을 같은 수로 확인한다).
const SLIDE_FORMATS = new Set(['pdf', 'pptx']);

/** 수강생에게 보이는 자료(manifest에서 hidden이 아닌 것)를 제목·용도·크기·버튼이 맞춰진 행으로 보여 준다. */
export function LectureDownloads() {
  const visible = HANSALIM_DOWNLOADS.filter(file => !file.hidden);

  return (
    <section id="downloads" className="scroll-mt-24" aria-labelledby="downloads-title">
      <LectureSectionHeading id="downloads-title" title="교육 자료 내려받기" />
      <ul className="divide-y divide-surface-200 border-y border-surface-200">
        {visible.map(item => (
          <DownloadRow key={item.key} item={item} />
        ))}
      </ul>
      <LectureFontHelp />
    </section>
  );
}

function DownloadRow({ item }: { item: HansalimDownload }) {
  const copy = HANSALIM_LECTURE.downloadCopy[item.key] ?? {
    title: item.title,
    summary: item.description,
    action: `${item.format} 받기`,
  };
  const pages = SLIDE_FORMATS.has(item.key) ? ` · ${HANSALIM_RELEASE.slides}장` : '';

  return (
    <li
      id={`download-${item.key}`}
      data-testid={`lecture-download-${item.key}`}
      className="grid scroll-mt-24 gap-4 py-5 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-8"
    >
      <div className="min-w-0">
        <h3 className="break-keep text-lg font-bold text-surface-900">{copy.title}</h3>
        <p className="mt-1 break-keep text-sm leading-6 text-surface-600">{copy.summary}</p>
        <p className="mt-1 text-sm text-surface-500">
          {item.format} · {item.size}
          {pages}
        </p>
      </div>
      <DownloadLink item={item} variant="secondary">
        {copy.action}
      </DownloadLink>
    </li>
  );
}

/** PPT 글꼴 안내는 필요한 사람만 펼쳐 보게 접어 둔다. 별도 글꼴 파일은 화면에 내놓지 않는다. */
function LectureFontHelp() {
  const help = HANSALIM_LECTURE.fontHelp;

  return (
    <details data-testid="lecture-font-help" className="group border-b border-surface-200">
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 text-base font-bold text-surface-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-surface-900 [&::-webkit-details-marker]:hidden">
        {help.title}
        <svg
          aria-hidden
          viewBox="0 0 20 20"
          className="h-5 w-5 shrink-0 text-surface-400 transition-transform group-open:rotate-180"
        >
          <path d="M5 7.5l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      </summary>
      <div className="space-y-3 pb-5 text-sm leading-6 text-surface-600">
        <p className="break-keep">{help.body}</p>
        <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-[5rem_1fr]">
          <dt className="font-bold text-surface-900">Windows</dt>
          <dd className="break-keep">
            <GuideText text={help.install.windows} />
          </dd>
          <dt className="font-bold text-surface-900">Mac</dt>
          <dd className="break-keep">
            <GuideText text={help.install.mac} />
          </dd>
        </dl>
        <p className="break-keep">{help.skip}</p>
      </div>
    </details>
  );
}
