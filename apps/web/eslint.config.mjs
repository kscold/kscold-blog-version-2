import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { FlatCompat } from '@eslint/eslintrc';
import { defineConfig, globalIgnores } from 'eslint/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default defineConfig([
  ...compat.extends('next/core-web-vitals'),
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@/widgets/admin',
              message: '관리자 화면은 라우트별 공개 진입점(@/widgets/admin/<route>)으로 가져오세요.',
            },
          ],
        },
      ],
    },
  },
  globalIgnores([
    '.next/**',
    '.next-e2e/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'cypress/screenshots/**',
    'cypress/videos/**',
    'coverage/**',
  ]),
]);
