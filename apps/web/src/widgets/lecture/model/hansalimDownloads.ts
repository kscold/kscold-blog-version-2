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
    bytes: 196536,
    size: '0.2MB',
    format: 'ZIP',
    sha256: '64df24baf6d8691dea21909690fa8dc2accb4dee8de9df319fce4eedead41cd8',
  },
  {
    order: 2,
    key: 'pdf',
    primary: false,
    title: '강의 자료 PDF',
    description:
      '강의 슬라이드 전체를 PDF로 담았습니다. Windows·Mac·휴대폰 어디서나 그대로 열립니다.',
    file: '한살림_AI교육_강의자료.pdf',
    bytes: 10027287,
    size: '10.0MB',
    format: 'PDF',
    sha256: 'c06522d7c09536d791df717e4155396633407e25733202218498d9ca21a1f565',
  },
  {
    order: 3,
    key: 'pptx',
    primary: false,
    title: '강의 자료 PPT',
    description:
      'PowerPoint에서 고쳐 쓸 수 있는 원본입니다. 발표자 노트에 강의 설명이 들어 있습니다.',
    note: 'PPT는 Noto Sans KR 글꼴로 만들었습니다. 글꼴이 없으면 글자가 넘칠 수 있으니 아래 글꼴을 먼저 설치하세요.',
    file: '한살림_AI교육_강의자료.pptx',
    bytes: 8612662,
    size: '8.6MB',
    format: 'PPTX',
    sha256: '0c147af085b4d5e803e99bb54ac91ef973a96d62c0720ef5bdcc64f1d22f36db',
  },
  {
    order: 4,
    key: 'font',
    primary: false,
    title: 'PPT 글꼴 (Noto Sans KR)',
    description:
      'PPT를 Windows·Mac PowerPoint에서 열기 전에 설치하는 글꼴입니다. 설치 방법이 함께 들어 있습니다.',
    file: '글꼴_NotoSansKR.zip',
    bytes: 6091950,
    size: '6.1MB',
    format: 'ZIP',
    sha256: 'cbe3c9685ef06f828728db00b17b8a3c2498635cb21b73149d0a68411c725079',
  },
] as const;

export type HansalimDownload = (typeof HANSALIM_DOWNLOADS)[number];
