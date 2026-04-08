import Link from 'next/link';

interface FeedEditorHeaderProps {
  isEditing: boolean;
}

export function FeedEditorHeader({ isEditing }: FeedEditorHeaderProps) {
  return (
    <div className="mb-8">
      <Link
        href="/admin/feed"
        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-surface-500 transition-colors hover:text-surface-900"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        피드 관리로 돌아가기
      </Link>
      <h1 className="text-3xl font-sans font-black tracking-tighter text-surface-900">
        {isEditing ? '피드 수정' : '새 피드 작성'}
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-surface-500 sm:text-base">
        노션처럼 본문, 이미지, 링크를 한 흐름으로 정리한 피드 작성 화면입니다. 폰과
        데스크톱 어디서든 같은 감각으로 짧은 기록을 남길 수 있게 구성했습니다.
      </p>
    </div>
  );
}
