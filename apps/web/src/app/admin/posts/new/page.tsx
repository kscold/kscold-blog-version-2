'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { useCategories } from '@/hooks/useCategories';
import { useCreatePost } from '@/hooks/usePosts';
import { MarkdownContent } from '@/components/blog/MarkdownContent';
import { PostCreateRequest } from '@/types/api';

const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

export default function NewPostPage() {
  const router = useRouter();
  const { data: categories } = useCategories();
  const createPost = useCreatePost();

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>('DRAFT');
  const [featured, setFeatured] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (title && !slug) {
      const autoSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9가-힣\s-]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 100);
      setSlug(autoSlug);
    }
  }, [title, slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !content || !categoryId) {
      alert('제목, 내용, 카테고리는 필수입니다.');
      return;
    }

    const tagIds = tags
      .split(',')
      .map(t => t.trim())
      .filter(t => t);

    const postData: PostCreateRequest = {
      title,
      slug: slug || undefined,
      content,
      excerpt: excerpt || undefined,
      coverImage: coverImage || undefined,
      categoryId,
      tagIds: tagIds.length > 0 ? tagIds : undefined,
      status,
      featured,
    };

    try {
      await createPost.mutateAsync(postData);
      alert('포스트가 생성되었습니다!');
      router.push('/admin/posts');
    } catch (error: any) {
      alert(`에러: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-secondary-beige dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-serif font-bold text-gray-900 dark:text-white">
              새 포스트 작성
            </h1>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              {showPreview ? '에디터' : '프리뷰'}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    제목 *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="포스트 제목을 입력하세요"
                    className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    required
                  />
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    슬러그 (자동 생성됨)
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={e => setSlug(e.target.value)}
                    placeholder="url-friendly-slug"
                    className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>

                {/* Content Editor */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    내용 * (Markdown)
                  </label>
                  {showPreview ? (
                    <div className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg p-6 min-h-[600px] overflow-auto">
                      <MarkdownContent content={content} />
                    </div>
                  ) : (
                    <div className="border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
                      <Editor
                        height="600px"
                        defaultLanguage="markdown"
                        value={content}
                        onChange={value => setContent(value || '')}
                        theme="vs-dark"
                        options={{
                          minimap: { enabled: false },
                          fontSize: 14,
                          lineNumbers: 'on',
                          wordWrap: 'on',
                          scrollBeyondLastLine: false,
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Excerpt */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    요약 (자동 생성 가능)
                  </label>
                  <textarea
                    value={excerpt}
                    onChange={e => setExcerpt(e.target.value)}
                    placeholder="포스트 요약을 입력하세요 (비워두면 자동 생성됩니다)"
                    rows={3}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Status */}
                <div className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    발행 설정
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                        상태
                      </label>
                      <select
                        value={status}
                        onChange={e => setStatus(e.target.value as 'DRAFT' | 'PUBLISHED')}
                        className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                      >
                        <option value="DRAFT">초안</option>
                        <option value="PUBLISHED">발행</option>
                      </select>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="featured"
                        checked={featured}
                        onChange={e => setFeatured(e.target.checked)}
                        className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <label
                        htmlFor="featured"
                        className="ml-2 text-sm text-gray-900 dark:text-white"
                      >
                        추천 포스트로 표시
                      </label>
                    </div>
                  </div>
                </div>

                {/* Category */}
                <div className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    카테고리 *
                  </h3>
                  <select
                    value={categoryId}
                    onChange={e => setCategoryId(e.target.value)}
                    className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                    required
                  >
                    <option value="">카테고리 선택</option>
                    {categories?.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {'  '.repeat(cat.depth)}
                        {cat.icon && `${cat.icon} `}
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tags */}
                <div className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">태그</h3>
                  <input
                    type="text"
                    value={tags}
                    onChange={e => setTags(e.target.value)}
                    placeholder="태그 ID (쉼표로 구분)"
                    className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    태그 ID를 쉼표로 구분하여 입력하세요
                  </p>
                </div>

                {/* Cover Image */}
                <div className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    커버 이미지
                  </h3>
                  <input
                    type="text"
                    value={coverImage}
                    onChange={e => setCoverImage(e.target.value)}
                    placeholder="이미지 URL"
                    className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                  {coverImage && (
                    <img
                      src={coverImage}
                      alt="Cover preview"
                      className="mt-4 w-full rounded-lg"
                      onError={e => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3">
                  <button
                    type="submit"
                    disabled={createPost.isPending}
                    className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {createPost.isPending ? '저장 중...' : '포스트 저장'}
                  </button>
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="w-full px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    취소
                  </button>
                </div>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
