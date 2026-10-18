export const INSTRUCTOR_PROFILE = {
  name: '김승찬',
  handle: 'kscold',
  headline: ['AI Agent,', '저와 함께 직접 써보시죠.'],
  role: '씨에스리 AI기술연구소 연구원 · AI Agent/풀스택 개발자',
  company: '콜딩(Colding) 대표 · Pawpong 운영',
  introduction: [
    '회사에서 B2B 업무 자동화와 AI Agent를 만들고 있습니다. Codex 같은 생성형 AI는 시연할 때만 꺼내지 않고, 기획부터 개발·검증·운영까지 실제 일에 씁니다.',
    '커머스 서비스 전환, SKT와 함께한 이벤트, 외부 납품, 개발 커뮤니티 운영처럼 성격이 다른 일을 두루 해 왔습니다. 그때마다 AI에게 빨리 만들게 하는 데서 끝내지 않고 요구사항을 정리하고 결과를 확인하는 일까지 같이 맡겼습니다.',
    '강의에서는 정답을 외우는 대신 내 업무를 작게 나눠 AI에게 맡기고 결과를 확인하는 과정을 같은 화면을 보며 해 봅니다. 사업·인사·총무·기획처럼 개발이 본업이 아닌 분도 바로 따라 할 수 있는 예시로 진행합니다.',
  ],
  highlights: [
    {
      value: '3,295명 지원 → 최종 30팀',
      label: '개인 15명·팀 15개 · OpenAI × 조코딩 × 프라이머 AI 해커톤 본선 진출',
    },
    {
      value: '400개 → 45개',
      label: '레거시 CMS 테이블을 도메인 모듈로 재설계',
    },
    {
      value: 'AI 기반 대규모 리팩토링',
      label: '결제(Payment) 코드 4,552줄을 AI와 함께 뜯어보고 다시 설계해 540줄로 줄였습니다',
    },
  ],
  axCases: [
    {
      category: '현업 AI Agent',
      title: '빅데이터 솔루션 AI Agent 개발',
      description:
        'LangGraph·RAG·LLM으로 빅데이터 솔루션에 들어가는 AI Agent를 만들고 있습니다. 데이터를 말로 물어보며 살펴보는 「바이브 분석」 기능입니다.',
    },
    {
      category: '국책 연구개발',
      title: '비정형 데이터 암호화 파이프라인',
      description:
        '문서와 이미지를 모으는 단계부터 개인정보 보호, 임베딩, 동형암호 벡터 색인까지 이어지는 처리 과정을 설계하고 만들고 있습니다.',
    },
    {
      category: '서비스 전환',
      title: '식후경 Eatbuy 2.0 전환',
      description:
        'Strapi CMS 테이블 약 400개를 NestJS 도메인 모듈 약 45개로 다시 설계했고, 프런트엔드가 쓰는 API의 90% 이상을 단계적으로 옮겼습니다.',
    },
    {
      category: '외주 프로젝트',
      title: '바람부는날에도 성형외과 사이트 리뉴얼',
      description:
        'Next.js와 MongoDB Atlas로 관리자 화면까지 갖춘 사이트를 만들었습니다. 한국어·일본어 지원과 운영 설명서, 프로젝트 인계까지 맡았습니다.',
    },
    {
      category: '외주 프로젝트',
      title: '한국기타가와 한국지사 사이트 리뉴얼',
      description:
        'NestJS와 MongoDB Atlas로 백엔드를 만들고, 일본 본사 사이트의 데이터를 가져와 정리한 뒤 GCP Cloud Run에 배포했습니다.',
    },
    {
      category: '서비스 운영',
      title: 'SKT × 식후경 이벤트 개발',
      description:
        '푼타컴퍼니에서 SKT와 식후경이 함께한 이벤트를 개발하고 운영했습니다. 외부 파트너와 연동하고 사용자가 한꺼번에 몰리는 상황을 직접 겪었습니다.',
    },
    {
      category: '기술 협업',
      title: 'MongoDB·Google Cloud 엔지니어 협업',
      description:
        '데이터 모델과 클라우드 운영 문제를 서비스 입장에서 정리해 MongoDB·Google Cloud 엔지니어와 함께 검토했습니다.',
    },
    {
      category: 'AI 네이티브 서비스',
      title: 'Pawpong 기획·개발·운영',
      description:
        '개인사업자로 반려동물 플랫폼 Pawpong을 운영합니다. 기획·콘텐츠·개발·운영 어디에든 AI를 붙여 쓰고 있습니다.',
    },
  ],
  audienceExamples: [
    ['사업', '자료 조사, 제안서 초안, 반복 보고 정리'],
    ['인사·총무', '신청·예약 흐름, 문서 분류, 사내 안내 자동화'],
    ['기획', '요구사항 구체화, 화면 초안, 데이터 정리'],
    ['운영·CS', 'FAQ 검색, 답변 초안, 알림과 후속 업무 연결'],
  ],
  teaching: [
    '슬라이드를 읽어 드리기보다 화면에서 직접 만들고 고쳐 보는 시간이 대부분입니다.',
    '요청을 잘 쓰는 법과 함께 AI가 틀린 곳을 찾아 고치는 습관도 같이 익힙니다.',
    '회사 자료와 개인정보를 어디까지 넣어도 되는지 현장에서 지킬 수 있는 기준으로 설명합니다.',
  ],
  experience: [
    {
      period: '2026.01 — 현재',
      organization: '씨에스리 AI기술연구소',
      role: '연구원(사원) · AI Agent/풀스택 개발자',
      description: 'AI Agent를 주로 만들고 서버와 웹 서비스도 개발',
    },
    {
      period: '2024.08 — 2026.01',
      organization: '푼타컴퍼니',
      role: '백엔드 개발자',
      description:
        '식후경 Eatbuy 2.0 백엔드 개발, 커머스 도메인 재설계, API 90% 이상 전환, 무중단 배포와 업무 자동화 구축',
    },
    {
      period: '개인사업',
      organization: '콜딩(Colding)',
      role: '대표 · kscold.com·Pawpong 운영',
      description:
        'AI Agent 실습 세션, 개발자 커뮤니티 프로그램, AI 네이티브 반려동물 플랫폼 기획·개발·운영',
    },
  ],
  teachingExperience: [
    'AI Agent Bloom 오프라인 실습 세션 기획·운영',
    '멋쟁이사자처럼 12기 부회장·프런트엔드 운영진, React 스터디 강의',
    'GDSC 3기 팀 스터디 팀장·프로젝트 개발 리드',
    '콩방(코딩 공방) 개발 동아리 리드 및 실무 중심 개발 지식 공유',
    '스마일게이트 후원·오렌지플래닛에서 진행하는 개모임(개발자 모임) 팀원, 개발 트렌드·지식 공유 참여',
    'Admin Night 기획·운영',
  ],
  awards: [
    'OpenAI × 조코딩 × 프라이머 AI 해커톤 본선 진출 (2026)',
    '융합클러스터 2.0 세종DX 해커톤 대상 (2024)',
    'ICT 학점연계 프로젝트 인턴십 우수성과 (2025)',
    'INHA SW NET-Zero 공동해커톤 우수상 (2024)',
  ],
  education: '상명대학교 소프트웨어학과 졸업',
  contacts: {
    email: 'coldingcontact@gmail.com',
    website: 'https://kscold.com',
    github: 'https://github.com/kscold',
  },
};
