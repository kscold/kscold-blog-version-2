export interface TeamMember {
  name: string;
  position: string;
  role: string;
  skills: string[];
  scope: string;
  department: 'product' | 'engineering' | 'design';
}

export interface TeamProfile {
  id: string;
  name: string;
  shortName: string;
  description: string;
  summary: string;
  externalUrl: string;
  keywords: string[];
  badge: {
    mark: string;
    backgroundColor: string;
    textColor: string;
  };
  members: TeamMember[];
}

const PAWPONG_TEAM_MEMBERS: TeamMember[] = [
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

const GOLE_TEAM_MEMBERS: TeamMember[] = [
  {
    name: '김수민',
    position: 'Full-stack Engineer',
    role: '백엔드·프론트엔드 풀스택 기능 개발',
    skills: ['Spring Boot', 'Next.js', 'TypeScript', 'MongoDB'],
    scope: '도메인 API, 사용자 화면, 데이터 연동, 테스트와 운영 개선',
    department: 'engineering',
  },
  {
    name: '김가원',
    position: 'Full-stack Engineer',
    role: '백엔드·프론트엔드 풀스택 기능 개발',
    skills: ['Spring Boot', 'Next.js', 'TypeScript', 'MongoDB'],
    scope: '도메인 API, 사용자 화면, 데이터 연동, 배포와 품질 개선',
    department: 'engineering',
  },
];

export const TEAM_PROFILES: TeamProfile[] = [
  {
    id: 'pawpong',
    name: 'Pawpong Team',
    shortName: 'pawpong',
    description: '반려동물 플랫폼 Pawpong 팀과 콜딩의 협업 구조, 팀 구성, 사업 정보를 소개합니다.',
    summary: '반려동물 플랫폼 · 6명',
    externalUrl: 'https://pawpong.kr',
    keywords: ['Pawpong', 'Colding', '팀 소개', '반려동물 플랫폼'],
    badge: {
      mark: 'P',
      backgroundColor: '#6B5744',
      textColor: '#A8C8E8',
    },
    members: PAWPONG_TEAM_MEMBERS,
  },
  {
    id: 'gole',
    name: 'GoLe Team',
    shortName: 'GoLe',
    description: '레고 중고거래 플랫폼 GoLe를 함께 만드는 풀스택 개발팀을 소개합니다.',
    summary: '레고 중고거래 플랫폼 · 2명',
    externalUrl: 'https://gole.co.kr',
    keywords: ['GoLe', 'Colding', '팀 소개', '레고 중고거래', '풀스택 개발'],
    badge: {
      mark: 'G',
      backgroundColor: '#123B66',
      textColor: '#FFD43B',
    },
    members: GOLE_TEAM_MEMBERS,
  },
];

export function getTeamProfile(teamId: string) {
  return TEAM_PROFILES.find(team => team.id === teamId);
}

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
