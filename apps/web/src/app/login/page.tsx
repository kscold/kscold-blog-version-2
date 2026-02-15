'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, register } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    displayName: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        await login.mutateAsync({
          email: formData.email,
          password: formData.password,
        });

        const redirect = searchParams.get('redirect') || '/admin';
        router.push(redirect);
      } else {
        await register.mutateAsync({
          email: formData.email,
          password: formData.password,
          username: formData.username,
          displayName: formData.displayName || formData.username,
        });

        router.push('/admin');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || '로그인에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-950 via-background-dark to-surface-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent-DEFAULT/10 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />

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
            <h1 className="text-5xl font-serif font-bold text-gradient mb-3 group-hover:scale-105 transition-transform">
              KSCOLD
            </h1>
            <p className="text-surface-400 text-sm tracking-wide">
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
            <div className="bg-surface-900 border border-white/10 rounded-[16px] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
              {/* Toggle Switch (Bank Style) */}
              <div className="flex items-center justify-center mb-8">
                <div className="relative inline-flex bg-surface-800 rounded-[8px] p-1">
                  <motion.div
                    className="absolute h-[calc(100%-8px)] bg-accent-DEFAULT rounded-[6px] transition-all duration-300"
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
                      isLogin ? 'text-white' : 'text-surface-400'
                    }`}
                  >
                    로그인
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsLogin(false)}
                    className={`relative z-10 px-6 py-2 text-sm font-semibold transition-colors duration-300 ${
                      !isLogin ? 'text-white' : 'text-surface-400'
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
                  className="text-sm text-surface-400 hover:text-accent-light transition-colors inline-flex items-center gap-2 group"
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
          className="mt-6 p-4 bg-accent-DEFAULT/10 border border-accent-DEFAULT/20 rounded-[12px] backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <p className="text-xs text-accent-light text-center">
            <strong>개발 모드:</strong> 백엔드 서버 확인 (localhost:8080)
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
