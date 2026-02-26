'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { useCategories } from '@/hooks/useCategories';
import { useUpdatePost } from '@/hooks/usePosts';
import { MarkdownContent } from '@/components/blog/MarkdownContent';
import { PostUpdateRequest } from '@/types/api';
import { apiClient } from '@/lib/api-client';

const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

export default function EditPostPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;

  const { data: categories } = useCategories();
  const updatePost = useUpdatePost();

  const [isLoading, setIsLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED' | 'ARCHIVED'>('DRAFT');
  const [featured, setFeatured] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const post: any = await apiClient.get(`/posts/${postId}`);

        setTitle(post.title);
        setSlug(post.slug);
        setContent(post.content);
        setExcerpt(post.excerpt || '');
        setCoverImage(post.coverImage || '');
        setCategoryId(post.category.id);
        setTags(post.tags?.map((t: any) => t.id).join(', ') || '');
        setStatus(post.status);
        setFeatured(post.featured || false);
      } catch (error) {
        console.error('Failed to fetch post:', error);
        alert('포스트를 불러오는데 실패했습니다.');
        router.push('/admin/posts');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [postId, router]);

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

    const postData: PostUpdateRequest = {
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
      await updatePost.mutateAsync({ id: postId, data: postData });
      alert('포스트가 수정되었습니다!');
      router.push('/admin/posts');
    } catch (error: any) {
      alert(`에러: ${error.response?.data?.message || error.message}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-secondary-beige dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">포스트를 불러오는 중...</p>
        </div>
      </div>
    );
  }

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
              포스트 수정
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
                    className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                    required
                  />
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    슬러그
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={e => setSlug(e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
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
                    요약
                  </label>
                  <textarea
                    value={excerpt}
                    onChange={e => setExcerpt(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
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
                        onChange={e =>
                          setStatus(e.target.value as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED')
                        }
                        className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                      >
                        <option value="DRAFT">초안</option>
                        <option value="PUBLISHED">발행</option>
                        <option value="ARCHIVED">보관</option>
                      </select>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="featured"
                        checked={featured}
                        onChange={e => setFeatured(e.target.checked)}
                        className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
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
                    className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
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
                    className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
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
                    disabled={updatePost.isPending}
                    className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updatePost.isPending ? '저장 중...' : '변경사항 저장'}
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push('/admin/posts')}
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
