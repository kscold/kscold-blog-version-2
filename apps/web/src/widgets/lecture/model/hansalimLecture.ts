import { HANSALIM_DOWNLOADS } from './hansalimDownloads';

export interface LectureReview {
  /** 블로그에 올린 후기 글의 경로. 예: /blog/dev-story/hansalim-ai-lecture-review */
  postPath: string;
  /** 다운로드 페이지에 보여 줄 한두 문장 요약 */
  summary: string;
  /** 후기 글의 대표 이미지(없으면 글자만 보여 준다) */
  coverImage?: string;
}

export type LecturePlatform = 'windows' | 'mac';

export interface FolderTreeItem {
  name: string;
  folder?: boolean;
  /** 이름 옆에 붙이는 짧은 설명 */
  note?: string;
  children?: FolderTreeItem[];
}

export interface LectureDownloadCopy {
  title: string;
  summary: string;
  action: string;
}

// 실습 ZIP 이름은 manifest에서 읽는다. 슬라이드와 먼저읽기.txt가 이 이름으로 안내한다.
const LAB_FILE =
  HANSALIM_DOWNLOADS.find(item => item.primary && !item.hidden)?.file ?? '실습 자료 ZIP';

// 문구는 강의 저장소 docs/한살림_블로그_개발요청.md의 「압축을 푼 뒤의 안내」를 옮겼다.
// 「」로 감싼 부분은 눌러야 할 메뉴·파일 이름이다. 화면에서는 괄호 없이 굵게, › 로 이은 메뉴는 차례대로 보여 준다.
const SETUP_STEPS: Record<LecturePlatform, string[]> = {
  windows: [
    `내려받은 「${LAB_FILE}」을 마우스 오른쪽으로 누르고 「모두 압축 풀기」를 선택합니다.`,
    '안쪽의 「한살림_AI실습」 폴더를 바탕 화면으로 옮깁니다.',
    'VS Code에서 「파일 › 폴더 열기 › 바탕 화면 › 한살림_AI실습 › 폴더 선택」을 누릅니다.',
  ],
  mac: [
    `「${LAB_FILE}」을 두 번 눌러 압축을 풉니다. 브라우저에서 이미 풀었다면 생긴 폴더를 사용합니다.`,
    '「한살림_AI실습」 폴더를 데스크탑으로 옮깁니다.',
    'VS Code에서 「파일 › 폴더 열기 › 데스크탑 › 한살림_AI실습 › 열기」를 누릅니다.',
  ],
};

// 실습길잡이는 ZIP의 먼저읽기.txt가 「처음 시작할 때 여세요」라고 안내하는 오늘 순서·확인 기준 문서다.
const SETUP_NOTES = [
  '준비가 되면 실습 폴더의 「실습길잡이.pdf」부터 여세요. 오늘 실습 순서와 확인 기준이 들어 있습니다.',
  'ZIP 안에서 바로 열지 말고, 압축을 푼 「한살림_AI실습」 폴더를 여세요.',
  'VS Code가 「이 폴더 작성자를 신뢰합니까?」라고 물으면 이 페이지에서 받은 수업 폴더인지 확인한 뒤 신뢰를 누릅니다.',
];

// 압축을 풀면 보이는 주요 항목만 그린다. 숨김 .claude 폴더 등 나머지 파일은 ZIP에 그대로 있다.
const FOLDER_TREE: FolderTreeItem = {
  name: '한살림_AI실습',
  folder: true,
  children: [
    { name: '먼저읽기.txt' },
    { name: '실습길잡이.pdf', note: '오늘 순서와 확인 기준' },
    { name: 'AGENTS.md' },
    { name: '입력자료', folder: true, note: '교육용 가상 자료' },
    { name: '프롬프트', folder: true, note: '복사해서 보낼 요청문' },
    { name: '결과', folder: true, note: '실습 결과를 저장할 곳' },
    {
      name: '글꼴',
      folder: true,
      children: [
        { name: 'NotoSansKR-Regular.ttf' },
        { name: 'NotoSansKR-Bold.ttf' },
        { name: '설치방법.txt' },
        { name: 'OFL.txt' },
      ],
    },
  ],
};

// 글꼴은 실습 ZIP에 들어 있을 뿐 PC에 설치되지는 않는다. 설치가 저절로 된다고 읽히지 않게 쓴다.
// 제공 PPT에는 글꼴이 내장되어 있지 않으므로 「설치가 전혀 필요 없다」고 쓰지 않는다.
const FONT_HELP = {
  title: 'PPT 글꼴이 다르게 보일 때',
  body: '실습 폴더의 글꼴 폴더에 Noto Sans KR이 들어 있습니다. PC에 이 글꼴이 없다면 두 .ttf 파일을 설치한 뒤 PowerPoint를 다시 여세요. PDF와 웹 슬라이드에는 설치가 필요하지 않습니다.',
  install: {
    windows:
      '「글꼴」 폴더의 두 .ttf를 함께 고른 뒤 마우스 오른쪽 버튼을 누르고 「설치」를 선택합니다. 메뉴에 없으면 「더 많은 옵션 표시」에서 찾습니다.',
    mac: '두 .ttf 파일을 각각 두 번 눌러 열고, 서체 관리자에서 「설치」를 누릅니다.',
  } satisfies Record<LecturePlatform, string>,
  skip: '이미 설치되어 있으면 건너뛰세요. 압축을 푸는 것만으로는 PC에 설치되지 않습니다.',
};

// 자료 목록에 보이는 짧은 이름과 버튼 문구. 여기에 없는 새 자료는 manifest의 제목·설명을 그대로 쓴다.
const DOWNLOAD_COPY: Record<string, LectureDownloadCopy> = {
  lab: {
    title: '실습 자료',
    summary: '가상 엑셀·요청문·실습 규칙·PPT용 글꼴',
    action: '실습 자료 받기',
  },
  pdf: { title: '강의 자료 PDF', summary: '보기·보관용 수강생 교재', action: 'PDF 받기' },
  pptx: {
    title: '강의 자료 PPT',
    summary: 'PowerPoint에서 편집할 수 있는 수강생 교재',
    action: 'PPT 받기',
  },
};

export const HANSALIM_LECTURE = {
  organization: '한살림성남용인',
  title: 'AI 업무활용 및 개인정보보호 교육',
  date: '2026-10-21',
  dateLabel: '2026.10.21(수)',
  schedule: '강의 10:00–13:00 · 실습 14:00–16:00 (자율 참여)',
  intro: '실습 자료를 내려받아 수업에 함께해 주세요.',
  primaryCaption: '가상 엑셀·요청문·PPT용 글꼴 포함',
  // 교육이 끝나고 후기 글을 올리면 여기에 채운다. 비어 있으면 후기 영역을 그리지 않는다.
  // 채우는 방법은 apps/web/docs/hansalim-review-guide.md 참고.
  review: null as LectureReview | null,
  setup: {
    steps: SETUP_STEPS,
    done: '왼쪽에 입력자료·프롬프트·결과가 보이면 준비됐습니다.',
    notes: SETUP_NOTES,
    tree: FOLDER_TREE,
  },
  fontHelp: FONT_HELP,
  downloadCopy: DOWNLOAD_COPY,
};
