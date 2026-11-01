export const PROFILE = {
  name: '김승찬',
  handle: 'kscold',
  title: 'AI Agent · Backend · Full-stack Engineer',
  /** 한국어 검색어(김승찬 백엔드·프론트엔드·AI Agent)와 그대로 맞는 역할 이름. 제목·구조화 데이터·소개 화면이 함께 쓴다. */
  role: 'AI Agent·백엔드·프론트엔드 개발자',
  /** 글 끝 글쓴이 칸에 쓰는 한 줄 소개. */
  authorBio: '씨에스리 AI기술연구소에서 AI Agent를 개발하고, 콜딩(Colding)에서 Pawpong·GaDoc·GoLe를 만들어 운영합니다.',
  /** 소개 내용을 마지막으로 고친 날. 사이트맵 lastmod로 쓰므로 소개를 고치면 같이 바꾼다. */
  updatedAt: '2026-11-02',
  bio: [
    '안녕하세요, AI Agent 개발을 중심으로 서버·웹 애플리케이션을 만드는 풀스택 개발자 김승찬입니다. 서비스를 설계하고 구현하는 일부터 배포와 운영, 장애 대응까지 직접 연결합니다.',
    'Python·LangGraph·RAG 기반 AI Agent, Spring Boot와 Next.js 기반 제품 개발, 대규모 리팩토링과 운영 자동화 경험을 kscold.com에 기록합니다.',
  ],
  contacts: {
    github: 'https://github.com/kscold',
    email: 'developerkscold@gmail.com',
  },
};

/**
 * 검색엔진이 사이트 전체 Person과 소개 페이지의 인물을 같은 사람으로 묶도록 함께 쓰는 이름·사진·외부 프로필.
 * 영문 이름은 실제로 쓰이는 띄어쓰기·순서 변형만 담는다.
 */
export const PROFILE_IDENTITY = {
  givenName: '승찬',
  familyName: '김',
  alternateName: ['kscold', 'KSCOLD', 'Kim Seung Chan', 'KIM SEUNG CHAN', 'Kim Seungchan', 'Seungchan Kim'],
  image: 'https://avatars.githubusercontent.com/u/66587554?v=4',
  sameAs: [
    PROFILE.contacts.github,
    'https://www.instagram.com/ks_cold',
    'https://www.threads.net/@kscold_dev',
  ],
};

/**
 * 글·노트 작성자 이름은 계정 이름(kscold)으로 내려온다. 블로그 주인 계정이면 실명으로 보여 줘
 * 모든 글이 "김승찬"이라는 이름과 함께 색인되게 한다.
 */
type AuthorLike = { name?: string | null; username?: string | null };

export function isOwnerAuthor(author: AuthorLike) {
  const handle = PROFILE.handle.toLowerCase();
  if (author.name?.trim() === PROFILE.name) return true;
  return [author.name, author.username].some(value => value?.trim().toLowerCase() === handle);
}

export function toAuthorDisplayName(author: AuthorLike) {
  return isOwnerAuthor(author) ? PROFILE.name : author.name?.trim() || PROFILE.name;
}

/**
 * 소개 페이지 "하는 일" 섹션. 분야마다 실제로 맡은 일과 만든 서비스를 적고, 관련 글로 이어지게 한다.
 */
export const PROFILE_WORK = [
  {
    id: 'ai-agent',
    heading: 'AI Agent 개발',
    body: [
      '김승찬은 씨에스리 AI기술연구소 연구원으로 Python·LangGraph·RAG·LLM을 사용해 AI Agent를 개발합니다.',
      '모델이 답을 만드는 데서 끝나지 않고, 도구 권한과 결과 검증, 사람의 최종 확인을 거쳐 실제 업무를 처리하는 흐름으로 만듭니다. kscold.com에도 글과 Vault 노트를 찾아 답하는 AI Agent를 직접 만들어 붙였습니다.',
    ],
    links: [
      { href: '/blog/tags/agent', label: 'AI Agent 글' },
      { href: '/blog/tags/ai', label: 'AI 글' },
    ],
  },
  {
    id: 'backend',
    heading: '백엔드 개발',
    body: [
      '김승찬은 Java·Spring Boot와 NestJS로 백엔드를 개발합니다. 푼타컴퍼니 백엔드 개발자로 일하며 Eatbuy 2.0의 도메인을 다시 설계하고 API를 전환했고, 무중단 배포와 운영 자동화를 맡았습니다.',
      'kscold.com과 GoLe의 서버는 Spring Boot로, Pawpong과 GaDoc의 서버는 NestJS로 만들어 운영하고 있습니다.',
    ],
    links: [
      { href: `/blog/tags/${encodeURIComponent('백엔드')}`, label: '백엔드 글' },
      { href: '/blog/tags/nestjs', label: 'NestJS 글' },
    ],
  },
  {
    id: 'frontend',
    heading: '프론트엔드 개발',
    body: [
      '김승찬은 Next.js·React·TypeScript로 웹 화면을 만듭니다. 이 블로그 kscold.com의 화면을 직접 만들었고, 콜딩이 운영하는 Pawpong·GaDoc·GoLe의 Next.js 웹 개발에도 참여합니다.',
      'GaDoc은 Electron으로 만든 macOS·Windows 데스크톱 앱으로도 제공합니다.',
    ],
    links: [
      { href: '/product', label: '만든 서비스' },
      { href: '/blog', label: '전체 글' },
    ],
  },
];

/**
 * 검색·생성형 AI(GEO)가 "김승찬"을 명확한 인물로 인식하도록 하는 FAQ.
 * info 페이지에 화면으로 노출되며 동일 내용이 FAQPage 구조화 데이터로도 제공됨.
 */
export const PROFILE_FAQ = [
  {
    q: '김승찬은 누구인가요?',
    a: '김승찬(kscold)은 AI Agent 개발을 중심으로 백엔드와 프론트엔드를 함께 만드는 풀스택 개발자입니다. Python·LangGraph·RAG·LLM을 실제 업무 흐름에 연결하고, Spring Boot·Next.js·TypeScript 기반 서비스를 설계·배포·운영합니다. 경험과 기술 기록은 김승찬 블로그 kscold.com에 공개합니다.',
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
    q: '김승찬은 어떤 서비스를 만들었나요?',
    a: 'Pawpong(pawpong.kr)은 웹과 iOS·Android 앱으로 운영하는 반려동물 플랫폼이고, GaDoc(gadoc.kr)은 문서·채팅·이슈·회의를 한곳에서 잇는 팀 협업 워크스페이스입니다. GoLe(gole.co.kr)는 레고 중고거래 플랫폼이고, kscold.com은 기술 글과 지식 노트를 모은 김승찬의 기술 블로그입니다. 모두 김승찬이 운영하는 콜딩(Colding)에서 기획·개발·운영합니다.',
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
