// 이 파일은 scripts/sync-hansalim-downloads.mjs가 강의 저장소의 manifest.json으로 만든다. 직접 고치지 않는다.
export const HANSALIM_DOWNLOADS = [
  {
    order: 1,
    key: 'lab',
    primary: true,
    title: '실습 자료 (오후 실습 폴더)',
    description:
      '압축을 풀면 한살림_AI실습 폴더가 나옵니다. 가상 엑셀·처리 규칙·요청문(프롬프트)·AGENTS.md가 들어 있습니다. 모든 자료는 교육용 가상 자료입니다.',
    file: '참가자용_실습자료.zip',
    bytes: 196572,
    size: '0.2MB',
    format: 'ZIP',
    sha256: 'dbfc4bedffd30860cc7399e81a46cdac3b38d7046c0fa68ba7b78132220dd799',
  },
  {
    order: 2,
    key: 'pdf',
    primary: false,
    title: '강의 자료 PDF',
    description:
      '강의 슬라이드 전체를 PDF로 담았습니다. Windows·Mac·휴대폰 어디서나 그대로 열립니다.',
    file: '한살림_AI교육_강의자료.pdf',
    bytes: 9913383,
    size: '9.9MB',
    format: 'PDF',
    sha256: '2ba0168833deac5b2ffe3689cc055576e5b11298df39b9c5ecaaff91889a1893',
  },
  {
    order: 3,
    key: 'pptx',
    primary: false,
    title: '강의 자료 PPT',
    description:
      'PowerPoint에서 고쳐 쓸 수 있는 원본입니다. 발표자 노트에 강의 설명이 들어 있습니다.',
    note: '자료를 내려받는 데 글꼴 설치는 필요 없습니다. Noto Sans KR이 없는 PC에서 PPT를 열거나 편집할 때만 아래 글꼴을 설치하세요.',
    file: '한살림_AI교육_강의자료.pptx',
    bytes: 8340699,
    size: '8.3MB',
    format: 'PPTX',
    sha256: 'ca85d66cc54e6ba860d47eb383d1b5dcb15a3cc0115d9d8f7f32c710c10e9fde',
  },
  {
    order: 4,
    key: 'font',
    primary: false,
    title: 'PPT 편집용 글꼴 (선택)',
    description:
      'PPT를 열거나 편집할 PC에 Noto Sans KR이 없을 때만 설치하세요. PDF·웹 슬라이드·실습 자료에는 필요 없습니다.',
    file: '글꼴_NotoSansKR.zip',
    bytes: 6091950,
    size: '6.1MB',
    format: 'ZIP',
    sha256: 'f5e6f0b68a4a1bded1e462da873350e914f1d3c646d2c6385466696f2e3cc03c',
  },
] as const;

export type HansalimDownload = (typeof HANSALIM_DOWNLOADS)[number];
