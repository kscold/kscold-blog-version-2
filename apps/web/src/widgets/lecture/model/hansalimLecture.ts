export interface LectureReview {
  /** 블로그에 올린 후기 글의 경로. 예: /blog/dev-story/hansalim-ai-lecture-review */
  postPath: string;
  /** 다운로드 페이지에 보여 줄 한두 문장 요약 */
  summary: string;
  /** 후기 글의 대표 이미지(없으면 글자만 보여 준다) */
  coverImage?: string;
}

export const HANSALIM_LECTURE = {
  organization: '한살림성남용인',
  title: 'AI 업무활용 및 개인정보보호 교육',
  date: '2026-10-21',
  dateLabel: '2026.10.21',
  firstStep: '실습 자료 ZIP을 내려받아 압축을 풀고, VS Code에서 한살림_AI실습 폴더를 여세요.',
  // 교육이 끝나고 후기 글을 올리면 여기에 채운다. 비어 있으면 후기 영역을 그리지 않는다.
  // 채우는 방법은 apps/web/docs/hansalim-review-guide.md 참고.
  review: null as LectureReview | null,
};
