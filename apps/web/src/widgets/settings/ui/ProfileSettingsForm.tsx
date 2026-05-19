'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useAuth } from '@/features/auth';
import { useUpdateProfile, useTechStacks } from '@/features/profile';
import { useMediaUpload } from '@/shared/lib/useMediaUpload';
import { TechStackSelector } from '@/shared/ui/TechStackSelector';
import { useAlert } from '@/shared/model/alertStore';

const SOCIAL_PLATFORMS = [
  { key: 'github', label: 'GitHub', placeholder: 'https://github.com/username' },
  { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/username' },
  { key: 'website', label: '웹사이트', placeholder: 'https://example.com' },
  { key: 'twitter', label: 'X / Twitter', placeholder: 'https://x.com/username' },
  { key: 'threads', label: 'Threads', placeholder: 'https://www.threads.net/@username' },
];

export function ProfileSettingsForm() {
  const { currentUser } = useAuth();
  const updateProfile = useUpdateProfile();
  const { data: sharedStacks } = useTechStacks();
  const { uploadFile, isUploading } = useMediaUpload();
  const alert = useAlert();

  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>({});
  const [techStack, setTechStack] = useState<string[]>([]);

  useEffect(() => {
    if (!currentUser) return;
    setDisplayName(currentUser.displayName || '');
    setBio(currentUser.bio || '');
    setAvatar(currentUser.avatar || '');
    setSocialLinks(currentUser.socialLinks || {});
    setTechStack(currentUser.techStack || []);
  }, [currentUser]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadFile(file);
      setAvatar(url);
    } catch {
      alert.error('이미지 업로드에 실패했습니다.');
    }
  };

  const handleSocialChange = (key: string, val: string) => {
    setSocialLinks(prev => val ? { ...prev, [key]: val } : Object.fromEntries(Object.entries(prev).filter(([k]) => k !== key)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile.mutateAsync({ displayName, bio, avatar, socialLinks, techStack });
      alert.success('프로필이 저장되었습니다.');
    } catch {
      alert.error('저장에 실패했습니다.');
    }
  };

  if (!currentUser) return null;

  const initials = (displayName || currentUser.username || '?')[0].toUpperCase();

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-8 max-w-2xl"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* 프로필 사진 */}
      <section className="bg-white border border-surface-200 rounded-2xl p-6">
        <h2 className="text-sm font-bold text-surface-900 mb-4 uppercase tracking-wider">프로필 사진</h2>
        <div className="flex items-center gap-5">
          <div className="relative w-20 h-20 rounded-full bg-surface-100 overflow-hidden shrink-0">
            {avatar ? (
              <Image src={avatar} alt="" fill sizes="80px" className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-surface-500">
                {initials}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <label className="inline-flex items-center gap-2 cursor-pointer px-4 py-2 text-sm font-medium border border-surface-200 rounded-xl hover:border-surface-900 transition-colors">
              {isUploading ? '업로드 중...' : '사진 변경'}
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={isUploading} />
            </label>
            {avatar && (
              <button type="button" onClick={() => setAvatar('')} className="block text-xs text-surface-400 hover:text-red-500 transition-colors">
                사진 제거
              </button>
            )}
            <p className="text-xs text-surface-400">JPG, PNG, GIF · 최대 10MB</p>
          </div>
        </div>
      </section>

      {/* 기본 정보 */}
      <section className="bg-white border border-surface-200 rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-bold text-surface-900 uppercase tracking-wider">기본 정보</h2>
        <div>
          <label className="block text-sm font-medium text-surface-700 mb-1.5">표시 이름</label>
          <input
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            maxLength={40}
            placeholder={currentUser.username}
            className="w-full px-3 py-2.5 text-sm border border-surface-200 rounded-xl focus:outline-none focus:border-surface-400 transition-colors"
          />
          <p className="mt-1 text-xs text-surface-400">피드, 댓글 등에 표시되는 이름입니다.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-surface-700 mb-1.5">소개</label>
          <textarea
            value={bio}
            onChange={e => setBio(e.target.value)}
            rows={3}
            maxLength={200}
            placeholder="간단한 자기소개를 입력하세요."
            className="w-full px-3 py-2.5 text-sm border border-surface-200 rounded-xl focus:outline-none focus:border-surface-400 transition-colors resize-none"
          />
          <p className="mt-1 text-xs text-surface-400">{bio.length}/200</p>
        </div>
      </section>

      {/* 기술 스택 */}
      <section className="bg-white border border-surface-200 rounded-2xl p-6">
        <h2 className="text-sm font-bold text-surface-900 uppercase tracking-wider mb-4">기술 스택</h2>
        <TechStackSelector value={techStack} sharedStacks={sharedStacks} onChange={setTechStack} />
      </section>

      {/* 소셜 링크 */}
      <section className="bg-white border border-surface-200 rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-bold text-surface-900 uppercase tracking-wider">소셜 링크</h2>
        {SOCIAL_PLATFORMS.map(({ key, label, placeholder }) => (
          <div key={key}>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">{label}</label>
            <input
              value={socialLinks[key] || ''}
              onChange={e => handleSocialChange(key, e.target.value)}
              placeholder={placeholder}
              type="url"
              className="w-full px-3 py-2.5 text-sm border border-surface-200 rounded-xl focus:outline-none focus:border-surface-400 transition-colors"
            />
          </div>
        ))}
      </section>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={updateProfile.isPending}
          className="px-6 py-2.5 bg-surface-900 text-white text-sm font-bold rounded-xl hover:bg-surface-700 transition-colors disabled:opacity-50"
        >
          {updateProfile.isPending ? '저장 중...' : '저장하기'}
        </button>
      </div>
    </motion.form>
  );
}
