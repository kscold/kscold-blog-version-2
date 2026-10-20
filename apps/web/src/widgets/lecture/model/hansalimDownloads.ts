// 이 파일은 scripts/sync-hansalim-downloads.mjs가 강의 저장소의 manifest.json으로 만든다. 직접 고치지 않는다.
export const HANSALIM_RELEASE = {
  releaseId: 'de438ce51fb51353',
  slides: 164,
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
    bytes: 6700255,
    size: '6.7MB',
    format: 'ZIP',
    sha256: 'd81357922e7b20c1c63d44256c07bd17c89b88e48f0a6a4e492ffadf0200e65c',
  },
  {
    order: 2,
    key: 'pdf',
    primary: false,
    hidden: false,
    title: '강의 자료 PDF',
    description: '수강생용 강의 자료입니다. 보기만 하실 때는 PDF를 받으세요.',
    file: '한살림_AI교육_강의자료.pdf',
    bytes: 9010309,
    size: '9.0MB',
    format: 'PDF',
    sha256: '973b37ef737ec320021cc06583d0f1f6bf338109ae5319eb4d4b5be7a32e7f62',
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
    bytes: 8382792,
    size: '8.4MB',
    format: 'PPTX',
    sha256: 'edc8143dc5199920b8b045bc7adff3de7c9f666f29e5178f2908e0b634437665',
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
