import Link from 'next/link';
import type { ReactNode } from 'react';
import { HANSALIM_DOWNLOADS, type HansalimDownload } from '../model/hansalimDownloads';

const FILE_BASE = '/hansalim/files/';
const SLIDES_HREF = '/hansalim/slides';

export function lectureFileHref(file: string) {
  return `${FILE_BASE}${encodeURIComponent(file)}`;
}

function fileHref(item: HansalimDownload) {
  return lectureFileHref(item.file);
}

export function LectureDownloads() {
  const primary = HANSALIM_DOWNLOADS.find(item => item.primary);
  const others = HANSALIM_DOWNLOADS.filter(item => !item.primary);

  return (
    <section id="downloads" className="p-6 sm:p-10 lg:p-12" aria-labelledby="downloads-title">
      <p className="mb-4 font-mono text-xs font-bold uppercase tracking-[0.24em] text-surface-400">
        Downloads
      </p>
      <h2
        id="downloads-title"
        className="break-keep text-2xl font-black tracking-tight sm:text-3xl"
      >
        교육 자료 내려받기
      </h2>
      {primary && <PrimaryDownload item={primary} />}
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {others.map(item => (
          <DownloadCard key={item.key} item={item} />
        ))}
      </div>
      <p className="mt-6 text-sm leading-6 text-surface-500">
        슬라이드는 「슬라이드로 보기」에서 내려받지 않고 바로 넘겨 볼 수 있습니다. PPT는
        PowerPoint에서 고쳐 쓰실 분만 받으시면 됩니다.
      </p>
    </section>
  );
}

function PrimaryDownload({ item }: { item: HansalimDownload }) {
  return (
    <article
      data-testid={`lecture-download-${item.key}`}
      className="mt-8 rounded-[1.75rem] bg-surface-900 p-5 text-white sm:p-8 print:bg-white print:text-surface-900 print:ring-1 print:ring-surface-200"
    >
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-300 print:text-primary-600">
        먼저 받으세요 · 오후 실습
      </p>
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <h3 className="break-keep text-2xl font-black tracking-tight sm:text-3xl">
            {item.title}
          </h3>
          <p className="mt-3 break-keep text-sm leading-7 text-surface-300 print:text-surface-600 sm:text-base">
            {item.description}
          </p>
          <FileMeta item={item} dark />
        </div>
        <DownloadButton item={item} primary />
      </div>
    </article>
  );
}

function DownloadCard({ item }: { item: HansalimDownload }) {
  return (
    <article
      id={`download-${item.key}`}
      data-testid={`lecture-download-${item.key}`}
      className="flex scroll-mt-6 flex-col rounded-2xl border border-surface-200 bg-white p-5 target:border-primary-500 target:ring-2 target:ring-primary-200"
    >
      <h3 className="break-keep text-lg font-black tracking-tight">{item.title}</h3>
      <p className="mt-2 flex-1 break-keep text-sm leading-6 text-surface-600">
        {item.description}
      </p>
      {'note' in item && item.note && (
        <Note>
          {item.note}{' '}
          <a
            href="#download-font"
            className="font-bold text-primary-700 underline underline-offset-4"
          >
            글꼴 받으러 가기
          </a>
        </Note>
      )}
      <FileMeta item={item} />
      {item.key === 'pdf' && (
        <Link
          href={SLIDES_HREF}
          data-testid="lecture-slides-link"
          className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-primary-600 px-5 py-3 text-sm font-black text-white transition-colors hover:bg-primary-700 print:hidden"
        >
          슬라이드로 보기 (전체 화면)
        </Link>
      )}
      <DownloadButton item={item} />
    </article>
  );
}

function Note({ children }: { children: ReactNode }) {
  return (
    <p className="mt-4 break-keep rounded-xl bg-primary-50 p-3 text-xs leading-5 text-primary-900 ring-1 ring-inset ring-primary-100">
      {children}
    </p>
  );
}

function FileMeta({ item, dark = false }: { item: HansalimDownload; dark?: boolean }) {
  return (
    <p className={`mt-4 font-mono text-xs ${dark ? 'text-surface-400' : 'text-surface-400'}`}>
      {item.format} · {item.size} · {item.file}
    </p>
  );
}

function DownloadButton({ item, primary = false }: { item: HansalimDownload; primary?: boolean }) {
  const base =
    'inline-flex w-full items-center justify-center gap-2 rounded-full font-black transition-colors print:hidden';
  const style = primary
    ? 'bg-white px-8 py-4 text-base text-surface-900 hover:bg-primary-100 lg:w-auto lg:shrink-0'
    : 'mt-4 bg-surface-900 px-5 py-3 text-sm text-white hover:bg-surface-700';

  return (
    <a href={fileHref(item)} download={item.file} className={`${base} ${style}`}>
      {item.format} 내려받기
      <span aria-hidden className="font-mono text-xs opacity-60">
        {item.size}
      </span>
    </a>
  );
}
