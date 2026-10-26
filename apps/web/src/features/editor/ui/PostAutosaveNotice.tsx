import type { PostAutosave } from '../lib/postAutosave';

interface Props {
  recovery: PostAutosave;
  existing: boolean;
  isOlder: boolean;
  onRestore: () => void;
  onDiscard: () => void;
}

export function PostAutosaveNotice({ recovery, existing, isOlder, onRestore, onDiscard }: Props) {
  return (
    <section aria-label="브라우저 임시 보관 복구" className="space-y-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
      <p className="font-semibold">이 브라우저에 임시 보관한 내용이 있습니다</p>
      <p>{new Date(recovery.savedAt).toLocaleString('ko-KR')} · {recovery.form.title || '제목 없음'}</p>
      {isOlder && <p>서버 저장본과 기준 시각이 다르거나 이전 형식입니다. 복구 전에 어느 내용이 최신인지 확인해 주세요.</p>}
      <p>{existing ? '제목·본문·요약 등 작성 내용만 복구합니다. 서버의 주소·카테고리·발행 설정은 유지됩니다.' : '새 글의 작성 내용을 복구합니다. 공개 설정은 초안으로 시작하며 주소는 다시 검증합니다.'}</p>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={onRestore} className="rounded-full bg-white px-4 py-2 font-semibold">작성 내용 복구</button>
        <button type="button" onClick={onDiscard} className="rounded-full border border-amber-200 px-4 py-2">임시 보관 버리기</button>
      </div>
    </section>
  );
}
