export interface TeamMember {
  name: string;
  position: string;
  role: string;
  skills: string[];
  scope: string;
  department: 'product' | 'engineering' | 'design';
}

export const TEAM_MEMBERS: TeamMember[] = [
  {
    name: '김승찬',
    position: 'CTO / Tech Lead',
    role: '사업자, 아키텍처 설계, 백엔드·인프라 총괄, 코드리뷰',
    skills: ['NestJS', 'MongoDB', 'Docker', 'CI/CD', 'Next.js'],
    scope: '시스템 설계, 배포 파이프라인, 백엔드, 프론트엔드',
    department: 'engineering',
  },
  {
    name: '현용찬',
    position: 'Product Manager',
    role: '제품 기획, 스프린트 관리, 프론트엔드 개발 겸임',
    skills: ['Next.js', 'React', 'CSS', 'Figma'],
    scope: '로드맵 수립, 일정 관리, 프론트엔드 기능 구현, 배포·퍼블리싱',
    department: 'product',
  },
  {
    name: '류태호',
    position: 'Software Engineer / Tech Lead',
    role: '풀스택 기능 개발, 백엔드 심화',
    skills: ['NestJS', 'Next.js', 'MongoDB'],
    scope: '백엔드 심화·프론트엔드 기능 개발, 버그 수정, 테스트',
    department: 'engineering',
  },
  {
    name: '김가원',
    position: 'Platform Engineer',
    role: '자동화 시스템, 데이터 파이프라인',
    skills: ['Python', 'NestJS', 'Next.js'],
    scope: '크롤링·자동화 스크립트, 데이터 처리, 풀스택 기능 개발',
    department: 'engineering',
  },
  {
    name: '김희영',
    position: 'Frontend Engineer',
    role: '프론트엔드 심화, UI 퍼블리싱',
    skills: ['Next.js', 'React', 'TypeScript', 'CSS'],
    scope: '컴포넌트 설계·구현, 페이지 개발, 상태 관리, API 연동',
    department: 'engineering',
  },
  {
    name: '최은진',
    position: 'Product Designer',
    role: 'UI/UX 디자인, CSS 구현',
    skills: ['Figma', 'CSS'],
    scope: '디자인 시안 제작, CSS 스타일링, 반응형 레이아웃, 퍼블리싱',
    department: 'design',
  },
];

export const BUSINESS_INFO = {
  companyName: '콜딩(Colding)',
  representative: '김승찬',
  registrationNumber: '457-49-00942',
  address: '경기도 김포시 김포한강9로75번길 66, 5층 (구래동, 국제프라자)',
  email: 'coldingcontact@gmail.com',
};

export interface PrivateDocs {
  servers: { label: string; command: string; password: string }[];
  sharedAccounts: { label: string; url?: string; email: string; password: string }[];
  envConfigs?: { label: string; content: string }[];
  notes: string[];
  businessRegistrationPdfUrl?: string;
}
