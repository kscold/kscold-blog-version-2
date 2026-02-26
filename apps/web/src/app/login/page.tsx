'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-surface-50 flex items-center justify-center">
          <p>Loading...</p>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginAsync, registerAsync, isLoggingIn, isRegistering } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    displayName: '',
  });
  const [error, setError] = useState('');

  const isLoading = isLoggingIn || isRegistering;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (isLogin) {
        await loginAsync({
          email: formData.email,
          password: formData.password,
        });

        const redirect = searchParams.get('redirect') || '/admin';
        router.push(redirect);
      } else {
        await registerAsync({
          email: formData.email,
          password: formData.password,
          username: formData.username,
          displayName: formData.displayName || formData.username,
        });

        router.push('/admin');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || '로그인에 실패했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-surface-50 to-surface-100" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02]" />

      <motion.div
        className="relative z-10 w-full max-w-[440px]"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Logo */}
        <motion.div
          className="text-center mb-12"
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
              Professional Development Blog
            </p>
          </Link>
        </motion.div>

        {/* 3D Card Container */}
        <div className="card-3d">
          <motion.div
            className="card-3d-inner"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="bg-white/80 backdrop-blur-xl border border-surface-200/60 rounded-[16px] p-8 shadow-[0_8px_32px_-8px_rgba(15,23,42,0.08)]">
              {/* Toggle Switch (Bank Style) */}
              <div className="flex items-center justify-center mb-8">
                <div className="relative inline-flex bg-surface-100/80 p-1 rounded-xl">
                  <motion.div
                    className="absolute h-[calc(100%-8px)] bg-white rounded-lg shadow-sm transition-all duration-300"
                    initial={false}
                    animate={{
                      width: 'calc(50% - 4px)',
                      x: isLogin ? 4 : 'calc(100% + 4px)',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setIsLogin(true)}
                    className={`relative z-10 px-6 py-2 text-sm font-semibold transition-colors duration-300 ${
                      isLogin ? 'text-surface-900' : 'text-surface-500'
                    }`}
                  >
                    로그인
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsLogin(false)}
                    className={`relative z-10 px-6 py-2 text-sm font-semibold transition-colors duration-300 ${
                      !isLogin ? 'text-surface-900' : 'text-surface-500'
                    }`}
                  >
                    회원가입
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-[8px]"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p className="text-sm text-red-400 text-center">{error}</p>
                </motion.div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  required
                />

                {!isLogin && (
                  <>
                    <Input
                      type="text"
                      placeholder="사용자명"
                      value={formData.username}
                      onChange={e => setFormData({ ...formData, username: e.target.value })}
                      required
                    />

                    <Input
                      type="text"
                      placeholder="표시 이름 (선택)"
                      value={formData.displayName}
                      onChange={e => setFormData({ ...formData, displayName: e.target.value })}
                    />
                  </>
                )}

                <Input
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  required
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isLoading}
                  className="w-full mt-6"
                >
                  {isLogin ? '로그인' : '회원가입'}
                </Button>
              </form>

              {/* Back to Home */}
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

        {/* Dev Notice */}
        <motion.div
          className="mt-6 p-4 bg-white/60 border border-surface-200/60 rounded-[12px] backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <p className="text-xs text-surface-500 text-center font-medium tracking-wide">
            <strong className="text-surface-900">개발 모드:</strong> 백엔드 서버 확인
            (localhost:8080)
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
