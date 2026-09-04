export const PROFILE = {
  name: '김승찬',
  handle: 'kscold',
  title: 'Backend · Full-stack · AI Agent Engineer',
  bio: [
    '안녕하세요, 백엔드·풀스택·AI Agent 개발자 김승찬입니다. 서비스를 설계하고 구현하는 일부터 배포와 운영, 장애 대응까지 직접 연결합니다.',
    'Spring Boot와 Next.js 기반 제품 개발, LangGraph·RAG를 활용한 AI Agent, 대규모 리팩토링과 운영 자동화 경험을 kscold.com에 기록합니다.',
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
    a: '김승찬(kscold)은 백엔드·풀스택·AI Agent 개발자입니다. Spring Boot·Next.js·TypeScript 기반 서비스를 설계하고 배포·운영하며, LangGraph·RAG·LLM을 실제 업무 흐름에 연결하는 AI Agent를 개발합니다. 경험과 기술 기록은 김승찬 블로그 kscold.com에 공개합니다.',
  },
  {
    q: 'kscold는 무엇인가요?',
    a: 'kscold는 개발자 김승찬의 온라인 핸들이자 개인 기술 블로그 kscold.com의 이름입니다. 영문 이름 Kim Seung Chan의 이니셜 KSC와, 이름의 "찬"이 가진 차갑다는 뜻에서 착안한 cold를 결합했습니다. kscold.com은 김승찬 블로그 또는 김승찬의 기술 블로그라고도 불립니다.',
  },
  {
    q: '콜딩(Colding)과 kscold는 어떤 관계인가요?',
    a: '콜딩(Colding)은 김승찬이 운영하는 개인사업자명입니다. kscold의 cold에 진행을 뜻하는 ing를 더한 이름이면서, 개발을 뜻하는 coding과 한 글자 차이인 언어유희를 담고 있습니다. KSCOLD는 개발자 핸들과 기술 블로그, Colding은 사업과 서비스 운영에 사용하는 이름입니다.',
  },
  {
    q: '김승찬은 어떤 기술을 다루나요?',
    a: 'Java·Spring Boot 기반 백엔드, React·Next.js·TypeScript 기반 프론트엔드, LangGraph·RAG·LLM을 활용한 AI Agent 개발을 다룹니다. PostgreSQL·MongoDB·Redis·Docker·AWS·GCP 환경의 배포와 운영까지 함께 수행합니다.',
  },
  {
    q: '김승찬의 개발 방식은 무엇이 다른가요?',
    a: '기능 구현에서 끝내지 않고 도메인 설계, 리팩토링, 테스트, 배포, 모니터링과 운영 문제 해결까지 하나의 흐름으로 다룹니다. AI도 단순 생성 도구가 아니라 권한과 검증, 사람의 최종 확인이 포함된 실행 가능한 Agent로 제품에 연결합니다.',
  },
  {
    q: '김승찬 블로그에서는 어떤 글을 볼 수 있나요?',
    a: '백엔드와 풀스택 개발 사례, 대규모 리팩토링과 서비스 운영 경험, AI Agent 설계와 RAG 실험, 기술 컨퍼런스 정리 및 개발자로서의 회고를 볼 수 있습니다.',
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
