import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { INSTRUCTOR_PROFILE } from '@/entities/profile';
import { InstructorProfileActions } from './InstructorProfileActions';

export function InstructorProfilePage() {
  const profile = INSTRUCTOR_PROFILE;

  return (
    <main className="min-h-screen bg-surface-50 px-4 py-6 text-surface-900 sm:px-6 sm:py-10 print:bg-white print:p-0">
      <article className="mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-surface-200 bg-white shadow-sm print:max-w-none print:rounded-none print:border-0 print:shadow-none">
        <header className="grid gap-8 border-b border-surface-200 p-6 sm:p-10 lg:grid-cols-[1fr_18rem] lg:p-12">
          <div>
            <div className="mb-8 flex items-center justify-between gap-4">
              <Link href="/" className="font-black tracking-tight text-surface-900 print:hidden">
                KSCOLD
              </Link>
              <InstructorProfileActions />
            </div>
            <p className="mb-4 font-mono text-xs font-bold uppercase tracking-[0.28em] text-primary-600">
              Instructor Profile · AX &amp; Codex
            </p>
            <h1 className="max-w-3xl text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              {profile.headline}
            </h1>
            <div className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-surface-500">
              <strong className="text-base text-surface-900">{profile.name}</strong>
              <span>{profile.role}</span>
              <span>{profile.company}</span>
            </div>
          </div>
          <div className="flex items-end lg:justify-end">
            <div className="relative aspect-[4/5] w-full max-w-[18rem] overflow-hidden rounded-[1.75rem] bg-surface-100">
              <Image
                src="https://avatars.githubusercontent.com/u/66587554?v=4"
                alt="강사 김승찬"
                fill
                sizes="(max-width: 1024px) 288px, 288px"
                className="object-cover"
                priority
              />
            </div>
          </div>
        </header>

        <section className="grid gap-10 p-6 sm:p-10 lg:grid-cols-[1.15fr_0.85fr] lg:p-12">
          <div>
            <SectionLabel>Profile</SectionLabel>
            <div className="space-y-4 text-base leading-8 text-surface-600">
              {profile.introduction.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {profile.highlights.map(item => (
              <div key={item.label} className="rounded-2xl bg-surface-50 p-5 ring-1 ring-inset ring-surface-200">
                <strong className="block text-xl font-black tracking-tight text-surface-900">{item.value}</strong>
                <span className="mt-1 block text-xs leading-5 text-surface-500">{item.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="border-y border-surface-200 bg-surface-900 p-6 text-white sm:p-10 lg:p-12 print:bg-white print:text-surface-900">
          <SectionLabel dark>AX in Practice</SectionLabel>
          <h2 className="max-w-2xl text-3xl font-black tracking-tight sm:text-4xl">AI를 실제 업무와 운영에 연결해 왔습니다.</h2>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {profile.axCases.map(item => (
              <div key={item.title} className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 print:border-surface-200 print:bg-white">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-300 print:text-primary-600">{item.category}</p>
                <h3 className="mt-3 text-lg font-black">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-surface-300 print:text-surface-600">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-10 p-6 sm:p-10 lg:grid-cols-2 lg:p-12">
          <div>
            <SectionLabel>For Every Team</SectionLabel>
            <h2 className="text-2xl font-black tracking-tight">비전공 부서의 언어로 바꿔 설명합니다.</h2>
            <div className="mt-6 divide-y divide-surface-200 border-y border-surface-200">
              {profile.audienceExamples.map(([team, example]) => (
                <div key={team} className="grid grid-cols-[5rem_1fr] gap-4 py-4 text-sm">
                  <strong>{team}</strong>
                  <span className="leading-6 text-surface-600">{example}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <SectionLabel>Teaching Style</SectionLabel>
            <h2 className="text-2xl font-black tracking-tight">화면을 보며 함께 나아가는 실습형 강의</h2>
            <ul className="mt-6 space-y-4">
              {profile.teaching.map((item, index) => (
                <li key={item} className="grid grid-cols-[2rem_1fr] gap-3 text-sm leading-6 text-surface-600">
                  <span className="font-mono font-bold text-primary-600">0{index + 1}</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <ProfileHistory />
        <ProfileFooter />
      </article>
    </main>
  );
}

function ProfileHistory() {
  const profile = INSTRUCTOR_PROFILE;

  return (
    <section className="grid gap-10 border-t border-surface-200 p-6 sm:p-10 lg:grid-cols-[1.2fr_0.8fr] lg:p-12">
      <div>
        <SectionLabel>Experience</SectionLabel>
        <div className="space-y-6">
          {profile.experience.map(item => (
            <div key={`${item.period}-${item.organization}`} className="grid gap-2 sm:grid-cols-[9rem_1fr]">
              <p className="font-mono text-xs text-surface-400">{item.period}</p>
              <div>
                <h3 className="font-black">{item.organization}</h3>
                <p className="mt-1 text-sm font-bold text-surface-600">{item.role}</p>
                <p className="mt-1 text-sm leading-6 text-surface-500">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-8">
        <CompactList title="강의·커뮤니티" items={profile.teachingExperience} />
        <CompactList title="수상·선발" items={profile.awards} />
        <div>
          <SectionLabel>Education</SectionLabel>
          <p className="text-sm leading-6 text-surface-600">{profile.education}</p>
        </div>
      </div>
    </section>
  );
}

function ProfileFooter() {
  const { contacts } = INSTRUCTOR_PROFILE;

  return (
    <footer className="flex flex-col gap-5 bg-surface-50 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-10 lg:p-12 print:bg-white">
      <div>
        <p className="text-lg font-black">강의 및 협업 문의</p>
        <a href={`mailto:${contacts.email}`} className="mt-1 block text-sm text-surface-500 hover:text-surface-900">{contacts.email}</a>
      </div>
      <div className="flex gap-4 text-sm font-bold">
        <a href={contacts.website} className="hover:text-primary-600">kscold.com</a>
        <a href={contacts.pawpong} target="_blank" rel="noreferrer" className="hover:text-primary-600">Pawpong</a>
        <a href={contacts.github} target="_blank" rel="noreferrer" className="hover:text-primary-600">GitHub</a>
      </div>
    </footer>
  );
}

function CompactList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <SectionLabel>{title}</SectionLabel>
      <ul className="space-y-2 text-sm leading-6 text-surface-600">
        {items.map(item => <li key={item}>— {item}</li>)}
      </ul>
    </div>
  );
}

function SectionLabel({ children, dark = false }: { children: ReactNode; dark?: boolean }) {
  return (
    <p className={`mb-4 font-mono text-xs font-bold uppercase tracking-[0.24em] ${dark ? 'text-surface-400 print:text-surface-500' : 'text-surface-400'}`}>
      {children}
    </p>
  );
}
