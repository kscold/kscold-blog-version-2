const highlights = [
  {
    label: 'NOTE',
    title: '지금 흐름 남기기',
    description: '생각, 진행 상황, 배운 점을 짧게 붙잡아 둘 수 있습니다.',
  },
  {
    label: 'MEDIA',
    title: '이미지 바로 첨부',
    description: '붙여넣기나 드래그만으로 작업 화면을 바로 올릴 수 있습니다.',
  },
  {
    label: 'COPILOT',
    title: '계획부터 함께 정리',
    description: '메모와 링크를 바탕으로 내 기록을 참고한 초안을 제안합니다.',
  },
];

export function FeedComposerHighlights() {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {highlights.map(item => (
        <div
          key={item.label}
          className="h-full rounded-2xl border border-surface-200 bg-surface-50 px-4 py-4"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-surface-400">
            {item.label}
          </p>
          <p className="mt-2 text-balance text-base font-semibold leading-6 text-surface-900">
            {item.title}
          </p>
          <p className="mt-1 text-sm leading-6 text-surface-500 [overflow-wrap:anywhere]">
            {item.description}
          </p>
        </div>
      ))}
    </div>
  );
}
