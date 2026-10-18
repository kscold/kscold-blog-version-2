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
    bytes: 197323,
    size: '0.2MB',
    format: 'ZIP',
    sha256: 'c1ec4bc058c8546f7498a994eb6db915be789dcb935633ce347e404c22202cc8',
  },
  {
    order: 2,
    key: 'pdf',
    primary: false,
    title: '강의 자료 PDF',
    description:
      '강의 슬라이드 전체를 PDF로 담았습니다. Windows·Mac·휴대폰 어디서나 그대로 열립니다.',
    file: '한살림_AI교육_강의자료.pdf',
    bytes: 9964806,
    size: '10.0MB',
    format: 'PDF',
    sha256: 'f69bde8ea10e062d491c004286527707ee27bba8fc5c6e87a8e02a258dc9c97e',
  },
  {
    order: 3,
    key: 'pptx',
    primary: false,
    title: '강의 자료 PPT',
    description:
      'PowerPoint에서 고쳐 쓸 수 있는 원본입니다. 발표자 노트에 강의 설명이 들어 있습니다.',
    note: '자료를 내려받는 데 글꼴 설치는 필요 없습니다. 이 PPT나 실습에서 만든 PPT를 열 PC에 Noto Sans KR이 없을 때만 아래 글꼴을 설치하세요.',
    file: '한살림_AI교육_강의자료.pptx',
    bytes: 8360813,
    size: '8.4MB',
    format: 'PPTX',
    sha256: '00a9b3d0710a8b311d295c0311affd5fe1c1bd614b4fb125bc82f522a2a92a30',
  },
  {
    order: 4,
    key: 'font',
    primary: false,
    title: 'PPT용 글꼴 (선택)',
    description:
      '제공된 PPT나 실습에서 만든 PPT를 열 PC에 Noto Sans KR이 없을 때 설치하세요. PDF·웹 슬라이드 보기와 ZIP 다운로드에는 필요 없습니다.',
    file: '글꼴_NotoSansKR.zip',
    bytes: 6091950,
    size: '6.1MB',
    format: 'ZIP',
    sha256: 'd5bf998f6bd8ab6b9d16224005e0bc5a73177e339cf7096b62785fa707f56aab',
  },
] as const;

export type HansalimDownload = (typeof HANSALIM_DOWNLOADS)[number];
