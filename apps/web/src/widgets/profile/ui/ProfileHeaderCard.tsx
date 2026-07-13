'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import type { PublicProfile } from '@/features/profile/api/useProfile';
import { ProfileTechStack } from './ProfileTechStack';
import { ProfileSocialLinks } from './ProfileSocialLinks';

interface Props {
  profile: PublicProfile;
}

export function ProfileHeaderCard({ profile }: Props) {
  return (
    <motion.div
      className="bg-white border border-surface-200 rounded-2xl p-6 mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-start gap-4">
        <div className="relative w-20 h-20 bg-surface-200 rounded-full overflow-hidden shrink-0">
          {profile.avatar ? (
            <Image src={profile.avatar} alt="" fill sizes="80px" className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-2xl font-bold text-surface-500">
                {profile.displayName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-surface-900">{profile.displayName}</h1>
          <p className="text-sm text-surface-400 mb-2">@{profile.username}</p>
          {profile.bio && (
            <p className="text-sm text-surface-700 whitespace-pre-wrap leading-relaxed">{profile.bio}</p>
          )}
        </div>
      </div>

      {/* 기술 스택 */}
      <ProfileTechStack techStack={profile.techStack} />

      {/* 소셜 링크 */}
      <ProfileSocialLinks socialLinks={profile.socialLinks} />
    </motion.div>
  );
}
