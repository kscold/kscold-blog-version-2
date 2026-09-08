import Link from 'next/link';
import { loadNoteDirectory } from '../lib/loadNoteDirectory';

export async function NoteDirectory() {
  const notes = await loadNoteDirectory();
  return (
    <article className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-black tracking-tight text-surface-900 sm:text-4xl">
        김승찬의 개발 지식 노트
      </h1>
      <p className="mt-5 leading-relaxed text-surface-600">
        백엔드와 프론트엔드 개발, 데이터베이스, AI Agent를 공부하고 구현하며 정리한 노트입니다.
        궁금한 개념을 제목으로 찾아 읽거나, Vault 그래프에서 관련 개념의 연결을 탐색할 수 있습니다.
      </p>
      <nav aria-label="개발 기록 탐색" className="my-6 flex flex-wrap gap-5 text-sm underline">
        <Link href="/info">작성자 김승찬 소개</Link>
        <Link href="/blog">개발 경험과 기술 블로그</Link>
        <Link href="/vault">Vault 지식 그래프</Link>
      </nav>
      <h2 className="mb-5 text-xl font-bold">제목으로 찾기 · {notes.length}개 노트</h2>
      {notes.length === 0 ? <p>아직 공개된 노트가 없습니다.</p> : (
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map(note => (
            <li key={note.slug}>
              <Link
                href={`/vault/${encodeURIComponent(note.slug)}`}
                prefetch={false}
                className="block rounded-lg border border-surface-200 bg-white px-4 py-3 text-sm text-surface-700 hover:border-surface-400 hover:text-surface-900 break-words"
              >
                {note.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
