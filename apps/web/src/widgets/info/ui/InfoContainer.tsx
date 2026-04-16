'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { PROFILE } from '@/entities/profile/model/profileData';
import { SkillsSection } from './SkillsSection';
import { ContactSection } from './ContactSection';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function InfoContainer() {
  return (
    <div className="min-h-screen bg-surface-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* 프로필 섹션 */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
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
        </motion.div>

        {/* 소개 섹션 */}
        <motion.section
          className="mb-16"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-sm font-bold text-surface-400 uppercase tracking-wider mb-6">About</h2>
          <div className="space-y-4">
            {PROFILE.bio.map((paragraph, i) => (
              <p key={i} className="text-surface-600 leading-relaxed">{paragraph}</p>
            ))}
          </div>
        </motion.section>

        <SkillsSection />
        <ContactSection />

        {/* 팀 소개 섹션 */}
        <motion.section
          className="mb-16"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.6, delay: 0.45 }}
        >
          <h2 className="text-sm font-bold text-surface-400 uppercase tracking-wider mb-6">Teams</h2>
          <div className="space-y-3">
            <TeamBadgeLink
              teamId="pawpong"
              name="Pawpong Team"
              desc="반려동물 플랫폼 · 6명"
              badgeColor="#6B5744"
              badgeTextColor="#A8C8E8"
              emoji="🐾"
              externalUrl="https://pawpong.kr"
            />
          </div>
        </motion.section>

        {/* 블로그 이동 버튼 */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Link
            href="/blog"
            className="inline-block px-8 py-3 bg-surface-900 text-white rounded-xl font-bold hover:bg-surface-800 transition-colors text-sm"
          >
            블로그 둘러보기
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

function TeamBadgeLink({ teamId, name, desc, badgeColor, badgeTextColor, emoji, externalUrl }: {
  teamId: string; name: string; desc: string; badgeColor: string; badgeTextColor: string; emoji: string; externalUrl: string;
}) {
  return (
    <Link
      href={`/info/${teamId}`}
      className="flex items-center gap-3 p-4 bg-white border border-surface-200 rounded-2xl hover:border-surface-400 hover:shadow-md transition-all group"
    >
      <div
        className="flex items-center gap-2 px-4 py-2 rounded-full shadow-sm flex-shrink-0"
        style={{ background: badgeColor }}
      >
        <span className="text-base">{emoji}</span>
        <span className="font-black text-sm tracking-tight" style={{ color: badgeTextColor }}>{teamId}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-surface-900 group-hover:text-surface-600 transition-colors">{name}</p>
        <p className="text-xs text-surface-400">{desc}</p>
      </div>
      <a
        href={externalUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={e => e.stopPropagation()}
        className="text-[10px] text-surface-400 hover:text-surface-600 underline mr-1"
      >
        {externalUrl.replace('https://', '')}
      </a>
      <svg className="w-4 h-4 text-surface-300 group-hover:text-surface-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
      </svg>
    </Link>
  );
}
