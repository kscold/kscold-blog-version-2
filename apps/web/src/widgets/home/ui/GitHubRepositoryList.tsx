import { motion } from 'framer-motion';
import type { GitHubRepositorySummary } from '@/entities/github';

interface Props {
  repositories: GitHubRepositorySummary[];
}

export function GitHubRepositoryList({ repositories }: Props) {
  if (repositories.length === 0) return null;

  return (
    <motion.div
      className="grid gap-4 md:grid-cols-3"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.35 }}
    >
      {repositories.map(repository => (
        <a
          key={repository.url}
          href={repository.url}
          target="_blank"
          rel="noreferrer"
          className="rounded-2xl border border-surface-200 bg-white p-5 transition-colors hover:border-surface-300"
        >
          <div className="flex items-center justify-between gap-3">
            <p className="truncate text-sm font-bold text-surface-900">{repository.name}</p>
            <span className="text-xs text-surface-400">★ {repository.stars}</span>
          </div>
          <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-surface-500">
            {repository.description || '저장소 설명이 없습니다.'}
          </p>
          <div className="mt-4 flex items-center justify-between text-xs text-surface-400">
            <span>{repository.language || 'Unknown'}</span>
            <span>{formatDate(repository.updatedAt)}</span>
          </div>
        </a>
      ))}
    </motion.div>
  );
}

function formatDate(value: string) {
  if (!value) return '업데이트 정보 없음';
  return new Date(value).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
}
