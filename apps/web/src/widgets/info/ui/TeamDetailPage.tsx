'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { BUSINESS_INFO } from '@/entities/profile';
import type { TeamProfile } from '@/entities/profile';
import { OrgChart } from './OrgChart';
import { MemberCard } from './MemberCard';
import { PrivateDocsSection } from './PrivateDocsSection';
import { TeamBrandBadge } from './TeamBrandBadge';

export function TeamDetailPage({ team }: { team: TeamProfile }) {
  const [leader, ...others] = team.members;

  return (
    <div className="min-h-screen bg-surface-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* 상단 네비 */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/info" className="text-surface-400 hover:text-surface-600 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <TeamBrandBadge team={team} />
          <div className="flex-1">
            <h1 className="text-xl font-black text-surface-900">{team.name}</h1>
            <p className="text-xs text-surface-400">{team.summary}</p>
          </div>
          <a href={team.externalUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-surface-400 hover:text-surface-700 transition-colors underline">
            {team.externalUrl.replace('https://', '')} →
          </a>
        </div>

        {/* 조직도 */}
        <motion.div
          className="mb-8 p-6 bg-white border border-surface-200 rounded-2xl shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-4">Organization</h2>
          <OrgChart team={team} />
        </motion.div>

        {/* 리더 카드 */}
        {leader && (
          <div className="mb-6">
            <MemberCard member={leader} index={0} isLeader />
          </div>
        )}

        {/* 팀원 카드 */}
        <div className="space-y-4 mb-8">
          {others.map((member, i) => (
            <MemberCard key={member.name} member={member} index={i} />
          ))}
        </div>

        {/* 사업자 정보 */}
        <motion.div
          className="p-5 bg-white border border-surface-200 rounded-2xl mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-3">Business Info</h2>
          <div className="text-sm text-surface-600 space-y-1">
            <p><span className="font-bold text-surface-800">{BUSINESS_INFO.companyName}</span> · 대표 {BUSINESS_INFO.representative}</p>
            <p>사업자등록번호: {BUSINESS_INFO.registrationNumber}</p>
            <p className="text-xs text-surface-400">{BUSINESS_INFO.address}</p>
            <p className="text-xs text-surface-400">{BUSINESS_INFO.email}</p>
          </div>
        </motion.div>

        {/* 팀 내부 문서 */}
        <PrivateDocsSection teamId={team.id} />
      </div>
    </div>
  );
}
