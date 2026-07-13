'use client';

import { motion } from 'framer-motion';

interface LoginErrorMessageProps {
  error: string;
}

export function LoginErrorMessage({ error }: LoginErrorMessageProps) {
  return (
    <motion.div
      className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-[8px]"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <p data-cy="auth-form-error" className="text-sm text-red-400 text-center">{error}</p>
    </motion.div>
  );
}
