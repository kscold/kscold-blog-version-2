import type { ReactNode } from 'react';
import type { HansalimDownload } from '../model/hansalimDownloads';

const FILE_BASE = '/hansalim/files/';

/**
 * 같은 출처의 자료 파일 주소. 파일 해시 앞 16자를 붙여 자료가 바뀌면 주소도 바뀌게 한다.
 * 서버는 질의 문자열을 보지 않고 같은 파일을 주므로, 최신인지는 내려받은 파일의 SHA-256으로 따로 확인한다.
 */
export function lectureFileHref(item: Pick<HansalimDownload, 'file' | 'sha256'>) {
  return `${FILE_BASE}${encodeURIComponent(item.file)}?v=${item.sha256.slice(0, 16)}`;
}

const STYLES = {
  // 한 화면에서 채운 버튼은 이것 하나만 쓴다.
  primary:
    'min-h-13 w-full bg-surface-900 px-8 text-base text-white hover:bg-surface-700 sm:w-auto',
  secondary:
    'min-h-12 w-full border border-surface-300 bg-white px-6 text-sm text-surface-900 hover:border-surface-900 sm:w-auto',
};

interface DownloadLinkProps {
  item: HansalimDownload;
  variant: keyof typeof STYLES;
  testId?: string;
  children: ReactNode;
}

/** 내려받는 파일 이름이 슬라이드 안내와 같도록 download 속성에 manifest의 파일 이름을 그대로 둔다. */
export function DownloadLink({ item, variant, testId, children }: DownloadLinkProps) {
  return (
    <a
      href={lectureFileHref(item)}
      download={item.file}
      data-testid={testId}
      className={`inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full font-bold transition-colors focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-surface-900 print:hidden ${STYLES[variant]}`}
    >
      {children}
    </a>
  );
}
