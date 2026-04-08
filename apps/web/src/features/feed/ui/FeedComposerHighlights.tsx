const highlights = [
  {
    label: 'Flow',
    title: '짧고 빠르게',
    description: '부담 없이 지금의 생각과 진행 상황을 바로 남길 수 있습니다.',
  },
  {
    label: 'Media',
    title: '붙여넣기 업로드',
    description: '이미지를 붙여넣거나 드래그해 바로 첨부할 수 있습니다.',
  },
  {
    label: 'Link',
    title: '링크 카드 미리보기',
    description: '공유할 자료가 있다면 링크 설명까지 함께 묶어둘 수 있습니다.',
  },
];

export function FeedComposerHighlights() {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {highlights.map(item => (
        <div
          key={item.label}
          className="rounded-2xl border border-surface-200 bg-surface-50 px-4 py-4"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-surface-400">
            {item.label}
          </p>
          <p className="mt-2 text-base font-semibold text-surface-900">{item.title}</p>
          <p className="mt-1 text-sm text-surface-500">{item.description}</p>
        </div>
      ))}
    </div>
  );
}
