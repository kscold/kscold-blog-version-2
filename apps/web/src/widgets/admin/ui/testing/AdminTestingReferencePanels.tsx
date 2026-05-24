import Link from 'next/link';
import { commands, scenarioLinks } from '@/widgets/admin/lib/adminTesting';

export function AdminTestingReferencePanels() {
  return (
    <>
      <section className="mb-10">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-surface-900">시나리오 바로가기</h2>
          <span className="text-xs font-medium text-surface-400">Public + Admin 흐름</span>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {scenarioLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              data-cy={link.dataCy}
              className="group rounded-2xl border border-surface-200 bg-white p-5 hover:border-surface-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 space-y-2">
                  <h3 className="text-base font-bold text-surface-900">{link.title}</h3>
                  <p className="text-sm leading-6 text-surface-500">{link.description}</p>
                </div>
                <span className="shrink-0 text-surface-300 group-hover:text-surface-500 transition-colors">
                  →
                </span>
              </div>
              <div className="mt-4 text-xs font-mono text-surface-400">{link.href}</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4">
        <div className="rounded-2xl border border-surface-200 bg-white p-5">
          <h2 className="mb-3 text-lg font-bold text-surface-900">로컬 실행 명령</h2>
          <div className="space-y-3">
            {commands.map(item => (
              <div
                key={item.command}
                data-cy={item.dataCy}
                className="rounded-xl border border-surface-100 bg-surface-50 px-4 py-3"
              >
                <div className="text-sm font-semibold text-surface-900">{item.title}</div>
                <code className="mt-2 block text-xs leading-6 text-surface-600 [overflow-wrap:anywhere] sm:text-sm">
                  {item.command}
                </code>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-surface-200 bg-white p-5">
          <h2 className="mb-3 text-lg font-bold text-surface-900">운영에서 보는 목적</h2>
          <ul className="space-y-2 text-sm leading-6 text-surface-500">
            <li>어떤 경로를 점검하는지 빠르게 공유하고 바로 실행까지 연결할 수 있습니다.</li>
            <li>모바일 레이아웃, 댓글/방명록 흐름, 어드민 관리 화면을 한 번에 훑을 수 있습니다.</li>
            <li>실패한 경우에도 마지막 화면과 로그를 남겨, 회사 밖에서도 흐름을 다시 볼 수 있습니다.</li>
          </ul>
        </div>
      </section>
    </>
  );
}
