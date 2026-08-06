import type { Metadata } from 'next';
import { INSTRUCTOR_PROFILE } from '@/entities/profile';
import { SITE_URL } from '@/shared/lib/seo';
import { JsonLd } from '@/shared/ui/JsonLd';
import { InstructorProfilePage } from '@/widgets/info';

export const metadata: Metadata = {
  title: '강사 김승찬 | AX·Codex 실무 활용',
  description: '현업 AI Agent 개발자 김승찬의 AX·Codex 실무 활용 강사 프로필입니다.',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

const instructorJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: INSTRUCTOR_PROFILE.name,
  alternateName: INSTRUCTOR_PROFILE.handle,
  jobTitle: INSTRUCTOR_PROFILE.role,
  description: INSTRUCTOR_PROFILE.introduction.join(' '),
  url: `${SITE_URL}/info/instructor`,
  sameAs: [INSTRUCTOR_PROFILE.contacts.website, INSTRUCTOR_PROFILE.contacts.pawpong, INSTRUCTOR_PROFILE.contacts.github],
  alumniOf: {
    '@type': 'CollegeOrUniversity',
    name: '상명대학교',
  },
};

export default function InstructorPage() {
  return (
    <>
      <JsonLd id="instructor-profile" data={instructorJsonLd} />
      <InstructorProfilePage />
    </>
  );
}
