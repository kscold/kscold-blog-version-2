import Link from 'next/link';
import Image from 'next/image';
import { PROFILE, PROFILE_FAQ, TEAM_PROFILES } from '@/entities/profile';
import type { TeamProfile } from '@/entities/profile';
import { SkillsSection } from './SkillsSection';
import { ContactSection } from './ContactSection';
import { TeamBrandBadge } from './TeamBrandBadge';

export function InfoContainer() {
  return (
    <div className="min-h-screen bg-surface-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* 프로필 섹션 */}
        <div className="text-center mb-16">
          <div className="w-28 h-28 rounded-full mx-auto mb-6 ring-4 ring-surface-200 overflow-hidden">
            <Image
              src="https://avatars.githubusercontent.com/u/66587554?v=4"
              alt={PROFILE.name}
              width={112}
              height={112}
              className="object-cover"
              priority
            />
          </div>
          <h1 className="text-4xl sm:text-5xl font-sans font-black tracking-tight text-surface-900 mb-2">
            {PROFILE.name}
          </h1>
          <p className="text-sm font-mono text-surface-400 mb-3">@{PROFILE.handle}</p>
          <p className="text-lg text-surface-500 font-medium">{PROFILE.title}</p>
        </div>

        {/* 소개 섹션 */}
        <section className="mb-16">
          <h2 className="text-sm font-bold text-surface-400 uppercase tracking-wider mb-6">About</h2>
          <div className="space-y-4">
            {PROFILE.bio.map((paragraph, i) => (
              <p key={i} className="text-surface-600 leading-relaxed">{paragraph}</p>
            ))}
          </div>
        </section>

        <SkillsSection />
        <ContactSection />

        {/* 팀 소개 섹션 */}
        <section className="mb-16">
          <h2 className="text-sm font-bold text-surface-400 uppercase tracking-wider mb-6">Teams</h2>
          <div className="space-y-3">
            {TEAM_PROFILES.map(team => (
              <TeamBadgeLink key={team.id} team={team} />
            ))}
          </div>
        </section>

        {/* 자주 묻는 질문 (FAQ) */}
        <section className="mb-16">
          <h2 className="text-sm font-bold text-surface-400 uppercase tracking-wider mb-6">FAQ</h2>
          <div className="space-y-3">
            {PROFILE_FAQ.map((item, i) => (
              <div key={i} className="bg-white border border-surface-200 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-surface-900 mb-2">{item.q}</h3>
                <p className="text-sm text-surface-600 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 블로그 이동 버튼 */}
        <div className="text-center">
          <Link
            href="/blog"
            className="inline-block px-8 py-3 bg-surface-900 text-white rounded-xl font-bold hover:bg-surface-800 transition-colors text-sm"
          >
            블로그 둘러보기
          </Link>
        </div>
      </div>
    </div>
  );
}

function TeamBadgeLink({ team }: { team: TeamProfile }) {
  return (
    <div
      className="flex items-center gap-3 p-4 bg-white border border-surface-200 rounded-2xl hover:border-surface-400 hover:shadow-md transition-all group"
    >
      <Link href={`/info/${team.id}`} className="flex min-w-0 flex-1 items-center gap-3">
        <TeamBrandBadge team={team} compact />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-surface-900 group-hover:text-surface-600 transition-colors">{team.name}</p>
          <p className="text-xs text-surface-400">{team.summary}</p>
        </div>
        <svg className="w-4 h-4 flex-shrink-0 text-surface-300 group-hover:text-surface-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </Link>
      <a
        href={team.externalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mr-1 hidden flex-shrink-0 text-[10px] text-surface-400 underline hover:text-surface-600 sm:inline"
      >
        {team.externalUrl.replace('https://', '')}
      </a>
    </div>
  );
}
