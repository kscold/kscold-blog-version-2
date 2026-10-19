// 이 파일은 scripts/sync-hansalim-downloads.mjs가 강의 저장소의 manifest.json으로 만든다. 직접 고치지 않는다.
export const HANSALIM_RELEASE = {
  releaseId: '40f770a94545ce85',
  slides: 165,
} as const;

export const HANSALIM_DOWNLOADS = [
  {
    order: 1,
    key: 'lab',
    primary: true,
    hidden: false,
    title: '실습 자료 (오후 실습 폴더)',
    description:
      '가상 엑셀, 요청문, 실습 규칙과 PPT용 글꼴을 함께 담았습니다. 압축을 풀어 한살림_AI실습 폴더를 여세요.',
    file: '참가자용_실습자료.zip',
    bytes: 6296657,
    size: '6.3MB',
    format: 'ZIP',
    sha256: 'e4e56a07426b94d3e03971e27876890a0e4791bed90eb2fdeba3345ea87ff14b',
  },
  {
    order: 2,
    key: 'pdf',
    primary: false,
    hidden: false,
    title: '강의 자료 PDF',
    description: '수강생용 강의 자료입니다. 보기만 하실 때는 PDF를 받으세요.',
    file: '한살림_AI교육_강의자료.pdf',
    bytes: 11107768,
    size: '11.1MB',
    format: 'PDF',
    sha256: 'a3a7a0abc7f1d8571a0a71458b6c8a50ac4ad55d719711172da431d4cd55f590',
  },
  {
    order: 3,
    key: 'pptx',
    primary: false,
    hidden: false,
    title: '강의 자료 PPT',
    description:
      'PowerPoint에서 편집할 수 있는 수강생용 자료입니다. 발표자 노트에 강의 설명이 들어 있습니다.',
    file: '한살림_AI교육_강의자료.pptx',
    bytes: 9297119,
    size: '9.3MB',
    format: 'PPTX',
    sha256: '4b3d621e54dee2e139cb7a35aaa63f42c494d660df7465d821b3c95e0460d6ed',
  },
  {
    order: 4,
    key: 'font',
    primary: false,
    hidden: true,
    title: 'PPT 글꼴 · 기존 링크 호환용',
    description:
      '글꼴은 실습 ZIP에 포함되어 있습니다. 이 별도 파일은 예전 링크 호환용이며 페이지에는 표시하지 않습니다.',
    file: '글꼴_NotoSansKR.zip',
    bytes: 6092143,
    size: '6.1MB',
    format: 'ZIP',
    sha256: 'abfcf318daf73ee16f38b186907223f1c4696f795ae43fb05e6a42636ad3892c',
  },
] as const;

export type HansalimDownload = (typeof HANSALIM_DOWNLOADS)[number];
