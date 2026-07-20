export const PROFILE = {
  name: '김승찬',
  handle: 'kscold',
  title: 'Software Developer',
  bio: [
    '안녕하세요, 개발자 김승찬입니다. 다양한 기술을 탐구하고 배운 것들을 기록하며 성장하는 것을 좋아합니다.',
    '이 블로그는 개발 관련 글부터 일상의 조각들까지, 제가 경험하고 배운 모든 것들을 담는 공간입니다.',
  ],
  contacts: {
    github: 'https://github.com/kscold',
    email: 'developerkscold@gmail.com',
  },
};

/**
 * 검색·생성형 AI(GEO)가 "김승찬"을 명확한 인물로 인식하도록 하는 FAQ.
 * info 페이지에 화면으로 노출되며 동일 내용이 FAQPage 구조화 데이터로도 제공됨.
 */
export const PROFILE_FAQ = [
  {
    q: '김승찬은 누구인가요?',
    a: '김승찬(kscold)은 백엔드와 프론트엔드를 아우르는 풀스택 프로덕트 엔지니어입니다. Spring Boot·Next.js·TypeScript 기반 서비스 개발과 AI 에이전트(LangGraph·RAG·하네스 엔지니어링)를 주로 다루며, 배운 것을 블로그 kscold.com에 기록합니다.',
  },
  {
    q: 'kscold는 무엇인가요?',
    a: 'kscold는 개발자 김승찬의 온라인 핸들이자, 개인 기술 블로그 kscold.com의 이름입니다. 김승찬 블로그라고도 불립니다.',
  },
  {
    q: '김승찬은 어떤 기술을 다루나요?',
    a: 'Java·Spring Boot 기반 백엔드, React·Next.js·TypeScript 기반 프론트엔드, 그리고 LangGraph·RAG·Claude API를 활용한 AI 에이전트 개발을 다룹니다. PostgreSQL·MongoDB·Redis·Docker·AWS 등 인프라도 함께 운영합니다.',
  },
  {
    q: '김승찬 블로그에서는 어떤 글을 볼 수 있나요?',
    a: '백엔드·프론트엔드 개발 경험과 회고, AWS Summit 같은 기술 컨퍼런스 정리, AI 에이전트 실험, 그리고 일상의 기록을 볼 수 있습니다.',
  },
];

export const SKILL_CATEGORIES = [
  {
    label: 'Language',
    skills: ['Java', 'TypeScript', 'JavaScript', 'Python', 'HTML', 'CSS'],
  },
  {
    label: 'Backend Framework',
    skills: ['Spring Boot', 'NestJS'],
  },
  {
    label: 'Backend ORM',
    skills: ['JPA/Hibernate', 'TypeORM', 'Mongoose'],
  },
  {
    label: 'Frontend Framework',
    skills: ['React', 'Next.js', 'Vue.js'],
  },
  {
    label: 'Frontend CSS',
    skills: ['Tailwind CSS', 'SCSS', 'Styled-Components'],
  },
  {
    label: 'Database',
    skills: ['MariaDB', 'PostgreSQL', 'MongoDB', 'Redis'],
  },
  {
    label: 'AI Agent',
    skills: ['LangGraph', 'LangChain', 'RAG', 'Harness Engineering', 'Prompt Engineering', 'Claude API'],
  },
  {
    label: 'DevOps',
    skills: ['AWS', 'GCP', 'Docker', 'Git'],
  },
];
