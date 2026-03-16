'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/features/auth/api/useAuth';
import Link from 'next/link';
import Input from '@/shared/ui/Input';
import Button from '@/shared/ui/Button';
import { AuthToggle } from '@/features/auth/ui/AuthToggle';

export function LoginForm() {
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
        // Open Redirect 방어: 상대 경로만 허용, 프로토콜 상대 URL(//) 차단
        const safeRedirect = redirect.startsWith('/') && !redirect.startsWith('//') ? redirect : '/admin';
        router.push(safeRedirect);
      } else {
        await registerAsync({
          email: formData.email,
          password: formData.password,
          username: formData.username,
          displayName: formData.displayName || formData.username,
        });

        router.push('/admin');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : '로그인에 실패했습니다.';
      setError(message);
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center p-4 relative overflow-hidden">
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

        {/* 3D 카드 컨테이너 */}
        <div className="card-3d">
          <motion.div
            className="card-3d-inner"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="bg-white/80 backdrop-blur-xl border border-surface-200/60 rounded-[16px] p-8 shadow-[0_8px_32px_-8px_rgba(15,23,42,0.08)]">
              <AuthToggle isLogin={isLogin} onToggle={setIsLogin} />

              {/* 오류 메시지 */}
              {error && (
                <motion.div
                  className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-[8px]"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p className="text-sm text-red-400 text-center">{error}</p>
                </motion.div>
              )}

              {/* 폼 */}
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
