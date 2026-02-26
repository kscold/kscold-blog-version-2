'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAdminFeeds, useDeleteFeed } from '@/hooks/useFeeds';

export default function AdminFeedPage() {
  const [page, setPage] = useState(0);
  const { data: feedsData, isLoading } = useAdminFeeds(page, 20);
  const deleteFeed = useDeleteFeed();

  const feeds = feedsData?.content || [];
  const totalPages = feedsData?.totalPages || 0;

  const handleDelete = async (id: string) => {
    if (!confirm('이 피드를 삭제하시겠습니까?')) return;
    try {
      await deleteFeed.mutateAsync(id);
    } catch (err: any) {
      alert(err.response?.data?.message || '삭제에 실패했습니다');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-surface-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-sans font-black tracking-tighter text-surface-900">
                피드 관리
              </h1>
              <p className="text-surface-500 mt-2">인스타 스타일 피드를 관리합니다</p>
            </div>
            <Link
              href="/admin/feed/new"
              className="px-6 py-3 bg-surface-900 text-white rounded-xl font-bold hover:bg-surface-800 transition-colors"
            >
              새 피드 작성
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-20 bg-white border border-surface-200 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : feeds.length > 0 ? (
            <div className="bg-white border border-surface-200 rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-surface-50 border-b border-surface-200">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-bold text-surface-500 uppercase tracking-wider">
                      내용
                    </th>
                    <th className="text-center px-4 py-3 text-xs font-bold text-surface-500 uppercase tracking-wider">
                      이미지
                    </th>
                    <th className="text-center px-4 py-3 text-xs font-bold text-surface-500 uppercase tracking-wider">
                      공개
                    </th>
                    <th className="text-center px-4 py-3 text-xs font-bold text-surface-500 uppercase tracking-wider">
                      좋아요
                    </th>
                    <th className="text-center px-4 py-3 text-xs font-bold text-surface-500 uppercase tracking-wider">
                      댓글
                    </th>
                    <th className="text-center px-4 py-3 text-xs font-bold text-surface-500 uppercase tracking-wider">
                      작성일
                    </th>
                    <th className="text-right px-6 py-3 text-xs font-bold text-surface-500 uppercase tracking-wider">
                      액션
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {feeds.map(feed => (
                    <tr key={feed.id} className="hover:bg-surface-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm text-surface-900 line-clamp-1 max-w-xs">
                          {feed.content}
                        </p>
                      </td>
                      <td className="text-center px-4 py-4">
                        <span className="text-sm text-surface-500">{feed.images.length}</span>
                      </td>
                      <td className="text-center px-4 py-4">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            feed.visibility === 'PUBLIC'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-surface-100 text-surface-500'
                          }`}
                        >
                          {feed.visibility === 'PUBLIC' ? '공개' : '비공개'}
                        </span>
                      </td>
                      <td className="text-center px-4 py-4 text-sm text-surface-500">
                        {feed.likesCount}
                      </td>
                      <td className="text-center px-4 py-4 text-sm text-surface-500">
                        {feed.commentsCount}
                      </td>
                      <td className="text-center px-4 py-4 text-xs text-surface-400">
                        {formatDate(feed.createdAt)}
                      </td>
                      <td className="text-right px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/feed/${feed.id}`}
                            className="text-xs font-medium text-surface-500 hover:text-surface-900"
                          >
                            보기
                          </Link>
                          <button
                            onClick={() => handleDelete(feed.id)}
                            className="text-xs font-medium text-red-500 hover:text-red-700"
                          >
                            삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-20 bg-white border border-surface-200 rounded-2xl">
              <h2 className="text-xl font-black text-surface-900 mb-2">피드가 없습니다</h2>
              <p className="text-sm text-surface-500 mb-6">첫 피드를 작성해보세요</p>
              <Link
                href="/admin/feed/new"
                className="inline-block px-6 py-3 bg-surface-900 text-white rounded-xl font-bold hover:bg-surface-800 transition-colors"
              >
                새 피드 작성
              </Link>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="px-4 py-2 text-sm font-medium bg-white border border-surface-200 rounded-lg disabled:opacity-30"
              >
                이전
              </button>
              <span className="flex items-center text-sm text-surface-500">
                {page + 1}/{totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                className="px-4 py-2 text-sm font-medium bg-white border border-surface-200 rounded-lg disabled:opacity-30"
              >
                다음
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
