import Image from 'next/image';
import { INSTRUCTOR_PROFILE } from '@/entities/profile';

const PHOTO = 'https://avatars.githubusercontent.com/u/66587554?v=4';

/**
 * 강의 자료 페이지 아래쪽에 붙이는 짧은 강사 소개.
 * 경력·연락처는 entities/profile에 있는 값만 쓰고 새로 지어 넣지 않는다.
 */
export function InstructorProfile() {
  const profile = INSTRUCTOR_PROFILE;
  const { contacts } = profile;
  // 참가자에게 필요한 두 문단(하는 일, 강의 방식)만 보여 준다. 가운데 문단은 지난 프로젝트 소개다.
  const [work, , teaching] = profile.introduction;

  return (
    <section
      id="instructor"
      aria-labelledby="instructor-title"
      className="scroll-mt-24 border-t border-surface-200 pt-10"
    >
      <h2 id="instructor-title" className="text-xl font-black tracking-tight text-surface-900">
        강사 소개
      </h2>
      <div className="mt-5 flex items-center gap-4">
        <Image
          src={PHOTO}
          alt={`강사 ${profile.name}`}
          width={64}
          height={64}
          className="h-16 w-16 shrink-0 rounded-full bg-surface-100 object-cover"
        />
        <div className="min-w-0">
          <p className="text-lg font-black text-surface-900">{profile.name}</p>
          <p className="break-keep text-sm leading-6 text-surface-500">{profile.role}</p>
          <p className="break-keep text-sm leading-6 text-surface-500">{profile.company}</p>
        </div>
      </div>
      <div className="mt-5 space-y-3 break-keep text-base leading-7 text-surface-600">
        <p>{work}</p>
        <p>{teaching}</p>
      </div>
      <p className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-surface-500">
        <span>강의 및 협업 문의</span>
        <a
          href={`mailto:${contacts.email}`}
          className="font-bold text-surface-800 hover:text-primary-700"
        >
          {contacts.email}
        </a>
        <a
          href={contacts.github}
          target="_blank"
          rel="noreferrer"
          className="font-bold text-surface-800 hover:text-primary-700"
        >
          GitHub
        </a>
      </p>
    </section>
  );
}
