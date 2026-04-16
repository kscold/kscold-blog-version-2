'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Input from '@/shared/ui/Input';
import Button from '@/shared/ui/Button';
import { AuthToggle } from '@/features/auth/ui/AuthToggle';
import { useLoginForm } from '@/features/auth/model/useLoginForm';

export function LoginForm() {
  const { error, formData, handleSubmit, isLoading, isLogin, setIsLogin, updateField } = useLoginForm();

  return (
    <div className="relative flex min-h-screen items-start justify-center overflow-hidden bg-surface-50 px-4 pb-10 pt-24 sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-surface-50 to-surface-100" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02]" />

      <motion.div
        className="relative z-10 w-full max-w-[440px]"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* 로고 */}
        <motion.div
          className="mb-8 text-center sm:mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Link href="/" className="inline-block group">
            <h1 className="text-5xl font-sans font-black tracking-tighter mb-3 group-hover:scale-105 transition-transform">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-surface-900 via-surface-500 to-surface-900 bg-[size:200%_auto] animate-shimmer">
                KSCOLD
              </span>
            </h1>
            <p className="text-surface-500 text-sm tracking-wide font-medium">
              김승찬의 블로그, 일상과 기술 기록
            </p>
          </Link>
        </motion.div>

        {/* 입체 카드 래퍼 */}
        <div className="card-3d">
          <motion.div
            className="card-3d-inner"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
            <div className="rounded-[16px] border border-surface-200/60 bg-white/80 p-6 shadow-[0_8px_32px_-8px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-8">
              <AuthToggle isLogin={isLogin} onToggle={setIsLogin} />

              {/* 오류 메시지 */}
              {error && (
                <motion.div
                  className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-[8px]"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p data-cy="auth-form-error" className="text-sm text-red-400 text-center">{error}</p>
                </motion.div>
              )}

              {/* 폼 */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={e => updateField('email', e.target.value)}
                  autoComplete="email"
                  data-cy={isLogin ? 'login-email-input' : 'register-email-input'}
                  required
                />

                {!isLogin && (
                  <>
                    <Input
                      type="text"
                      placeholder="사용자명"
                      value={formData.username}
                      onChange={e => updateField('username', e.target.value)}
                      helperText="사용자명은 3-20자까지 사용할 수 있어요."
                      autoComplete="username"
                      data-cy="register-username-input"
                      minLength={3}
                      maxLength={20}
                      required
                    />

                    <Input
                      type="text"
                      placeholder="표시 이름 (선택)"
                      value={formData.displayName}
                      onChange={e => updateField('displayName', e.target.value)}
                      helperText="비워두면 사용자명이 그대로 표시됩니다."
                      autoComplete="nickname"
                      data-cy="register-display-name-input"
                      maxLength={30}
                    />
                  </>
                )}

                <Input
                  type="password"
                  placeholder={isLogin ? '••••••••' : '8자 이상 비밀번호'}
                  value={formData.password}
                  onChange={e => updateField('password', e.target.value)}
                  helperText={!isLogin ? '비밀번호는 최소 8자 이상이어야 합니다.' : undefined}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  data-cy={isLogin ? 'login-password-input' : 'register-password-input'}
                  minLength={isLogin ? undefined : 8}
                  required
                />

                {isLogin && (
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <Link
                      href="/login/recovery?tab=username"
                      data-cy="login-find-username"
                      className="font-medium text-surface-500 transition hover:text-surface-900"
                    >
                      아이디 찾기
                    </Link>
                    <Link
                      href="/login/recovery?tab=password"
                      data-cy="login-reset-password"
                      className="font-medium text-surface-500 transition hover:text-surface-900"
                    >
                      비밀번호 재설정
                    </Link>
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isLoading}
                  className="w-full mt-6"
                  data-cy={isLogin ? 'login-submit' : 'register-submit'}
                >
                  {isLogin ? '로그인' : '회원가입'}
                </Button>
              </form>

              {/* 홈 이동 링크 */}
              <div className="mt-6 text-center">
                <Link
                  href="/"
                  className="text-sm font-medium text-surface-500 hover:text-surface-900 transition-colors inline-flex items-center gap-2 group"
                >
                  <svg
                    className="w-4 h-4 group-hover:-translate-x-1 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  홈으로 돌아가기
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
