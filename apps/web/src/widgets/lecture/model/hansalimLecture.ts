export interface LectureReview {
  /** 블로그에 올린 후기 글의 경로. 예: /blog/dev-story/hansalim-ai-lecture-review */
  postPath: string;
  /** 다운로드 페이지에 보여 줄 한두 문장 요약 */
  summary: string;
  /** 후기 글의 대표 이미지(없으면 글자만 보여 준다) */
  coverImage?: string;
}

export interface LectureSetupStep {
  title: string;
  windows: string;
  mac: string;
  /** 모두가 하지 않아도 되는 단계(글꼴 설치 등) */
  optional?: boolean;
  /** 이 단계에 필요한 파일 카드로 이어 주는 링크 */
  link?: { href: string; label: string };
}

// 강의 저장소 downloads/README.md의 「페이지에 그대로 보여 줄 안내」를 옮겨 둔다. 문구는 슬라이드와 맞춰야 하므로 고치지 않는다.
const SETUP_STEPS: LectureSetupStep[] = [
  {
    title: '실습 자료 압축 풀기',
    windows: 'ZIP 마우스 오른쪽 › 모두 압축 풀기 › 압축 풀기',
    mac: 'ZIP을 두 번 클릭',
  },
  {
    title: '바탕화면에 두기',
    windows: '안쪽의 「한살림_AI실습」 폴더를 바탕 화면으로 끌어 놓기',
    mac: '「한살림_AI실습」 폴더를 데스크탑으로 끌어 놓기',
  },
  {
    title: 'VS Code로 열기',
    windows: '파일 › 폴더 열기 › 바탕 화면 › 한살림_AI실습 › 폴더 선택',
    mac: '파일 › 폴더 열기 › 데스크탑 › 한살림_AI실습 › 열기',
  },
  {
    title: 'PPT 글꼴 설치',
    windows: '글꼴 ZIP을 풀고 두 .ttf를 함께 골라 마우스 오른쪽 › 설치',
    mac: '.ttf를 두 번 클릭 › 서체 관리자에서 설치',
    optional: true,
    link: { href: '#download-font', label: 'PPT용 글꼴 받기' },
  },
];

const SETUP_NOTES = [
  'VS Code가 「이 폴더 작성자를 신뢰합니까?」라고 물으면 신뢰를 누릅니다.',
  '글꼴을 설치한 뒤 PowerPoint를 껐다 켭니다. 실습에서 AI가 만드는 PPT도 같은 글꼴(AGENTS.md 규칙)을 씁니다.',
];

export const HANSALIM_LECTURE = {
  organization: '한살림성남용인',
  title: 'AI 업무활용 및 개인정보보호 교육',
  date: '2026-10-21',
  dateLabel: '2026.10.21',
  firstStep: '실습 자료 ZIP을 내려받아 압축을 풀고, VS Code에서 한살림_AI실습 폴더를 여세요.',
  // 교육이 끝나고 후기 글을 올리면 여기에 채운다. 비어 있으면 후기 영역을 그리지 않는다.
  // 채우는 방법은 apps/web/docs/hansalim-review-guide.md 참고.
  review: null as LectureReview | null,
  setup: { steps: SETUP_STEPS, notes: SETUP_NOTES },
};
