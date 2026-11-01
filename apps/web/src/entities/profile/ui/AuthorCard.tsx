import Image from 'next/image';
import Link from 'next/link';
import { PROFILE, PROFILE_IDENTITY } from '../model/profileData';

/** 글 끝에서 글쓴이가 누구인지 알려 주는 칸. 모든 글에 이름·하는 일·소개 페이지 링크를 함께 남긴다. */
export function AuthorCard() {
  return (
    <aside
      aria-label="글쓴이"
      className="mb-12 flex items-start gap-4 rounded-2xl border border-surface-200 bg-white p-5"
    >
      <Image
        src={PROFILE_IDENTITY.image}
        alt={`${PROFILE.name} 프로필 사진`}
        width={56}
        height={56}
        className="h-14 w-14 shrink-0 rounded-full object-cover"
      />
      <div className="min-w-0">
        <p className="text-xs text-surface-500">글쓴이</p>
        <p className="mt-0.5 font-bold text-surface-900">
          <Link href="/info" rel="author" className="underline-offset-4 hover:underline">
            {PROFILE.name}
          </Link>
          <span className="ml-2 font-mono text-xs font-normal text-surface-500">@{PROFILE.handle}</span>
        </p>
        <p className="mt-1 text-sm font-medium text-surface-700">{PROFILE.role}</p>
        <p className="mt-2 text-sm leading-relaxed text-surface-600">{PROFILE.authorBio}</p>
        <Link
          href="/info"
          className="mt-3 inline-block text-sm text-surface-700 underline underline-offset-4 hover:text-surface-900"
        >
          {PROFILE.name} 소개 보기
        </Link>
      </div>
    </aside>
  );
}
