import Link from 'next/link';

const scenarioLinks = [
  {
    title: '메인 홈',
    description: '히어로 문구와 주요 CTA, 공개 내비게이션을 확인합니다.',
    href: '/',
    dataCy: 'admin-qa-scenario-home',
  },
  {
    title: '방명록',
    description: '로그인 상태별 안내, 작성, 삭제 흐름을 점검합니다.',
    href: '/guestbook',
    dataCy: 'admin-qa-scenario-guestbook',
  },
  {
    title: '블로그 목록',
    description: '카테고리, 검색, 카드 레이아웃 반응형을 확인합니다.',
    href: '/blog',
    dataCy: 'admin-qa-scenario-blog',
  },
  {
    title: '피드',
    description: '댓글 작성 정책과 리스트 배치를 확인합니다.',
    href: '/feed',
    dataCy: 'admin-qa-scenario-feed',
  },
  {
    title: 'Vault',
    description: '노트 탐색과 댓글 흐름, 모바일 레이아웃을 확인합니다.',
    href: '/vault',
    dataCy: 'admin-qa-scenario-vault',
  },
  {
    title: '채팅 관리',
    description: '관리자 채팅방 목록과 대화 화면을 점검합니다.',
    href: '/admin/chat',
    dataCy: 'admin-qa-scenario-admin-chat',
  },
  {
    title: '포스트 관리',
    description: '모바일 카드 레이아웃과 관리 액션을 확인합니다.',
    href: '/admin/posts',
    dataCy: 'admin-qa-scenario-admin-posts',
  },
];

const commands = [
  {
    title: '전체 E2E 실행',
    command: 'pnpm --dir apps/web test:e2e',
    dataCy: 'admin-qa-command-run',
  },
  {
    title: 'Cypress 러너 열기',
    command: 'pnpm --dir apps/web cy:open',
    dataCy: 'admin-qa-command-open',
  },
];

export function AdminTestingSection() {
  return (
    <div data-cy="admin-qa-page" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-sans font-black tracking-tighter text-surface-900">
          QA / E2E
        </h1>
        <p className="mt-3 max-w-2xl text-sm sm:text-base text-surface-500 leading-relaxed">
          운영 어드민에서 바로 시나리오 링크를 확인할 수 있게 정리한 페이지입니다. Cypress
          러너 자체는 각 개발 머신 로컬에서 실행되지만, 실제 점검 경로와 실행 명령은 여기서
          한 번에 확인할 수 있습니다.
        </p>
      </div>

      <section className="mb-10">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="text-lg font-bold text-surface-900">시나리오 바로가기</h2>
          <span className="text-xs font-medium text-surface-400">Public + Admin 흐름</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {scenarioLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              data-cy={link.dataCy}
              className="group rounded-2xl border border-surface-200 bg-white p-5 hover:border-surface-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-surface-900">{link.title}</h3>
                  <p className="mt-2 text-sm text-surface-500 leading-relaxed">{link.description}</p>
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
          <h2 className="text-lg font-bold text-surface-900 mb-3">로컬 실행 명령</h2>
          <div className="space-y-3">
            {commands.map(item => (
              <div
                key={item.command}
                data-cy={item.dataCy}
                className="rounded-xl border border-surface-100 bg-surface-50 px-4 py-3"
              >
                <div className="text-sm font-semibold text-surface-900">{item.title}</div>
                <code className="mt-2 block text-xs sm:text-sm text-surface-600 break-all">
                  {item.command}
                </code>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-surface-200 bg-white p-5">
          <h2 className="text-lg font-bold text-surface-900 mb-3">운영에서 보는 목적</h2>
          <ul className="space-y-2 text-sm text-surface-500 leading-relaxed">
            <li>어떤 경로를 점검하는지 빠르게 공유할 수 있습니다.</li>
            <li>모바일 레이아웃, 댓글/방명록 흐름, 어드민 관리 화면을 한 번에 훑을 수 있습니다.</li>
            <li>Cypress가 타는 실제 시나리오 경로를 운영과 동일한 URL로 맞출 수 있습니다.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
