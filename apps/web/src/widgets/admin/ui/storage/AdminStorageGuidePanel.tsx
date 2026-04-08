export function AdminStorageGuidePanel() {
  return (
    <section className="rounded-2xl border border-surface-200 bg-white p-5">
      <h2 className="text-lg font-bold text-surface-900">운영 가이드</h2>
      <ul className="mt-3 space-y-2 text-sm leading-6 text-surface-500">
        <li>이 페이지는 `blog` 버킷만 다루며, 다른 서비스 버킷은 보이지 않습니다.</li>
        <li>이미지는 여기서 미리보기로 확인하고, 다른 파일은 다운로드로 점검할 수 있습니다.</li>
        <li>폴더 삭제는 내부 파일까지 함께 정리되므로, 필요한 경로인지 한 번 더 확인하고 진행하세요.</li>
      </ul>
    </section>
  );
}
