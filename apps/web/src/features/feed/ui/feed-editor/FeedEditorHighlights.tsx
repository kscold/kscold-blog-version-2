const HIGHLIGHTS = [
  {
    label: 'Flow',
    title: '짧고 선명하게',
    description: '긴 글보다 지금의 생각과 장면을 빠르게 남기는 데에 맞춘 화면입니다.',
  },
  {
    label: 'Media',
    title: '붙여넣기와 드래그 업로드',
    description: '캡처나 이미지를 그대로 붙여넣어도 바로 업로드할 수 있습니다.',
  },
  {
    label: 'Preview',
    title: '링크 카드까지 한 화면에서',
    description: '외부 링크가 있으면 미리보기를 보면서 맥락을 함께 정리할 수 있습니다.',
  },
];

export function FeedEditorHighlights() {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {HIGHLIGHTS.map(item => (
        <div key={item.label} className="rounded-2xl border border-surface-200 bg-surface-50 px-4 py-4">
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
