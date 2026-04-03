import Image from 'next/image';
import type { QaSession } from '@/widgets/admin/lib/adminTesting';
import { formatLogOutput, formatScreenshotLabel } from '@/widgets/admin/lib/adminTesting';

interface AdminTestingArtifactsPanelProps {
  session: QaSession | null;
  latestScreenshot: string | null;
  hasSession: boolean;
}

export function AdminTestingArtifactsPanel({
  session,
  latestScreenshot,
  hasSession,
}: AdminTestingArtifactsPanelProps) {
  return (
    <>
      <section className="mb-10 grid grid-cols-1 xl:grid-cols-[1.2fr_1fr] gap-4">
        <div className="rounded-2xl border border-surface-200 bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-surface-900">실행 로그</h2>
            <span className="text-xs font-medium text-surface-400">{session?.logs.length || 0} lines</span>
          </div>
          <div className="mt-4 rounded-2xl bg-surface-950 text-surface-100 p-4 min-h-[280px] max-h-[420px] overflow-auto">
            <pre
              data-cy="admin-qa-log-panel"
              className="text-[11px] sm:text-xs leading-6 whitespace-pre-wrap break-words font-mono"
            >
              {session?.logs.length
                ? formatLogOutput(session.logs)
                : 'QA 세션을 시작하면 로그가 이곳에 쌓입니다.'}
            </pre>
          </div>
        </div>

        <div className="rounded-2xl border border-surface-200 bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-surface-900">최신 스크린샷</h2>
            <span className="text-xs font-medium text-surface-400">
              {session?.screenshots.length || 0} captured
            </span>
          </div>
          <div className="mt-4 rounded-2xl border border-surface-100 bg-surface-50 overflow-hidden">
            {latestScreenshot ? (
              <div className="relative aspect-[16/10]">
                <Image
                  src={latestScreenshot}
                  alt="QA 최신 스크린샷"
                  fill
                  unoptimized
                  className="object-cover object-top"
                  sizes="(max-width: 1280px) 100vw, 540px"
                />
              </div>
            ) : (
              <div className="flex min-h-[260px] items-center justify-center px-6 text-center text-sm text-surface-400">
                테스트가 진행되면 단계별 스크린샷이 이곳에 올라옵니다.
              </div>
            )}
          </div>
          {latestScreenshot ? (
            <a
              href={latestScreenshot}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex text-sm font-semibold text-surface-700 hover:text-surface-900"
            >
              원본 이미지 열기
            </a>
          ) : null}
        </div>
      </section>

      <section className="mb-10">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="text-lg font-bold text-surface-900">스크린샷 타임라인</h2>
          <span className="text-xs font-medium text-surface-400">
            {hasSession ? '세션 아티팩트' : '세션 시작 전'}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {session?.screenshots.length ? (
            session.screenshots.map(item => (
              <a
                key={item.url}
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="group overflow-hidden rounded-2xl border border-surface-200 bg-white hover:border-surface-300 hover:shadow-sm transition-all"
              >
                <div className="relative aspect-[16/10] bg-surface-100">
                  <Image
                    src={item.url}
                    alt={item.name}
                    fill
                    unoptimized
                    className="object-cover object-top"
                    sizes="(max-width: 1280px) 100vw, 420px"
                  />
                </div>
                <div className="px-4 py-3">
                  <div className="text-sm font-semibold text-surface-900 break-all">
                    {formatScreenshotLabel(item.name)}
                  </div>
                  <div className="mt-1 text-xs text-surface-400">새 탭에서 원본 보기</div>
                </div>
              </a>
            ))
          ) : (
            <div className="col-span-full rounded-2xl border border-dashed border-surface-200 bg-surface-50 px-6 py-10 text-center text-sm text-surface-400">
              아직 저장된 스크린샷이 없습니다.
            </div>
          )}
        </div>
      </section>
    </>
  );
}
