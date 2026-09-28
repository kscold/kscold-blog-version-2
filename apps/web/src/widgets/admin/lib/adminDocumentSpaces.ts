import type {
  AdminDocumentCategory,
  AdminDocumentSpace,
  AdminDocumentSpaceDetails,
} from '../model/adminDocumentTypes';

export const DOCUMENT_SPACES: Record<AdminDocumentSpace, AdminDocumentSpaceDetails> = {
  all: {
    id: 'all',
    href: '/admin/documents',
    title: '개인 문서함',
    navigationLabel: '전체 문서',
    description: '이력서, 경력의 근거 자료, 면접과 회고 스토리를 각각의 공간에서 관리합니다.',
    listHeading: '보관한 전체 문서',
    uploadHeading: '원본 파일 업로드',
    uploadGuide: '문서의 용도에 맞는 분류를 선택해 여러 원본 파일을 함께 올려 주세요.',
    descriptionPlaceholder: '예: 2026년 9월 경력 자료 정리',
  },
  resumes: {
    id: 'resumes',
    href: '/admin/documents/resumes',
    title: '이력서 관리',
    navigationLabel: '이력서 관리',
    description:
      '제출용 이력서와 편집 원본을 보관합니다. 지원처와 작성일을 기록해 버전을 구분하세요.',
    listHeading: '이력서와 버전 원본',
    uploadHeading: '이력서 원본 업로드',
    uploadGuide: '제출할 PDF와 편집용 Word·Markdown·HTML 원본을 이력서로 보관합니다.',
    descriptionPlaceholder: '예: 2026년 9월 지원용 · 백엔드 개발자 이력서 v2',
    fixedCategory: 'RESUME',
  },
  sources: {
    id: 'sources',
    href: '/admin/documents/sources',
    title: '경력 소스 관리',
    navigationLabel: '경력 소스 관리',
    description: '경력 서술을 뒷받침할 커밋, 실측 수치, 프로젝트 기록과 출처 자료를 따로 모읍니다.',
    listHeading: '경력 근거와 소스 자료',
    uploadHeading: '경력 소스 업로드',
    uploadGuide: '소스 뱅크, 수치 원장, 커밋 근거와 원석 자료는 제출용 이력서와 분리해 보관합니다.',
    descriptionPlaceholder: '예: AI Agent 프로젝트 · 실측 지표와 근거 커밋',
    fixedCategory: 'CAREER',
  },
  stories: {
    id: 'stories',
    href: '/admin/documents/stories',
    title: '스토리 관리',
    navigationLabel: '스토리 관리',
    description:
      '면접과 회고에서 풀어낼 이야기를 정리합니다. 문제, 판단, 행동과 결과를 기록하세요.',
    listHeading: '면접과 회고 스토리',
    uploadHeading: '스토리 원본 업로드',
    uploadGuide: '면접 답변, 프로젝트 회고와 경험별 이야기를 문서로 모아 두세요.',
    descriptionPlaceholder: '예: 배포 장애 대응 · 문제와 판단, 행동, 배운 점',
    fixedCategory: 'STORY',
  },
};

export function documentSpaceForCategory(category?: AdminDocumentCategory) {
  return (
    Object.values(DOCUMENT_SPACES).find(space => space.fixedCategory === category && category) ??
    DOCUMENT_SPACES.all
  );
}
