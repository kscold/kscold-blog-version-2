'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import Input from '@/shared/ui/Input';
import Button from '@/shared/ui/Button';
import { AuthToggle } from '@/features/auth/ui/AuthToggle';
import { LoginBrandHeader } from '@/features/auth/ui/LoginBrandHeader';
import { LoginErrorMessage } from '@/features/auth/ui/LoginErrorMessage';
import { RegisterFields } from '@/features/auth/ui/RegisterFields';
import { LoginRecoveryLinks } from '@/features/auth/ui/LoginRecoveryLinks';
import { LoginHomeLink } from '@/features/auth/ui/LoginHomeLink';
import { useLoginForm } from '@/features/auth/model/useLoginForm';
import { slugify } from '@/features/auth/lib/slugify';

export function LoginForm() {
  const { error, formData, handleSubmit, isLoading, isLogin, setIsLogin, updateField } = useLoginForm();
  const usernameManuallyEdited = useRef(false);

  const handleDisplayNameChange = (value: string) => {
    updateField('displayName', value);
    if (!usernameManuallyEdited.current) {
      const suggested = slugify(value);
      updateField('username', suggested);
    }
  };

  const handleUsernameChange = (value: string) => {
    usernameManuallyEdited.current = value !== slugify(formData.displayName);
    updateField('username', value.toLowerCase().replace(/[^a-z0-9_]/g, ''));
  };

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
        <LoginBrandHeader />

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
              {error && <LoginErrorMessage error={error} />}

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
                  <RegisterFields
                    displayName={formData.displayName}
                    username={formData.username}
                    onDisplayNameChange={handleDisplayNameChange}
                    onUsernameChange={handleUsernameChange}
                  />
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

                {isLogin && <LoginRecoveryLinks />}

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
              <LoginHomeLink />
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
