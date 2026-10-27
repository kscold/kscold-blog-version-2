import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';

export default defineConfig([
  ...nextVitals,
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@/widgets/admin',
              message:
                '관리자 화면은 라우트별 공개 진입점(@/widgets/admin/<route>)으로 가져오세요.',
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
    'coverage/**',
    'public/pdfjs/**',
  ]),
]);
