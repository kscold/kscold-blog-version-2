import fs from 'node:fs/promises';
import path from 'node:path';
import type { PresenterSlide } from '../model/presenterSlide';

// scripts/sync-hansalim-presenter.mjs가 쓰는 곳. Git에서 제외되고 배포 파일에만 들어간다.
// next.config의 outputFileTracingIncludes로 standalone 빌드에도 함께 복사된다.
// E2E는 HANSALIM_PRESENTER_DIR로 시험용 가짜 대본(e2e/fixtures/hansalim-presenter)을 읽는다.
const PRESENTER_DIR = path.resolve(
  process.cwd(),
  process.env.HANSALIM_PRESENTER_DIR || 'private/hansalim-presenter'
);

interface PresenterData {
  deckSha256: string;
  slides: PresenterSlide[];
}

/** 강사 대본을 읽는다. 자료가 아직 없으면(로컬·CI) null을 돌려준다. 관리자 확인 뒤에만 부른다. */
export async function readPresenterData(): Promise<PresenterData | null> {
  try {
    const text = await fs.readFile(path.join(PRESENTER_DIR, 'slides.json'), 'utf8');
    const data = JSON.parse(text) as PresenterData;
    return Array.isArray(data.slides) && data.slides.length > 0 ? data : null;
  } catch {
    return null;
  }
}

/** 강사용 PDF를 읽는다. 없으면 null. */
export async function readPresenterDeck(): Promise<Buffer | null> {
  try {
    return await fs.readFile(path.join(PRESENTER_DIR, 'deck.pdf'));
  } catch {
    return null;
  }
}
