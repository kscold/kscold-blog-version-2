'use client';

import { useMemo, useState } from 'react';
import { useCategories } from '@/entities/category';
import { useMergeTags, useReindexTags, useTagIndex, useUpdateTag } from '@/entities/tag';
import { isSystemTagName } from '@/shared/lib/tags';
import { useAlert } from '@/shared/model/alertStore';

const UNCATEGORIZED = '분류 안 됨';

export function TagCatalogPanel() {
  const alerts = useAlert();
  const { data: index = [], error, isLoading } = useTagIndex();
  const { data: categories = [] } = useCategories();
  const reindexTags = useReindexTags();
  const mergeTags = useMergeTags();
  const updateTag = useUpdateTag();

  const [mergeTargets, setMergeTargets] = useState<Record<string, string>>({});

  const tags = useMemo(() => index.filter(tag => !isSystemTagName(tag.name)), [index]);
  const unregistered = tags.filter(tag => tag.unregistered).length;
  const uncategorized = tags.filter(tag => !tag.categoryId).length;

  const handleReindex = async () => {
    if (
      !window.confirm(
        '피드 전용 태그를 등록하고, 분류되지 않은 태그를 글 사용량 기준으로 정리할까요?'
      )
    ) {
      return;
    }
    try {
      const changed = await reindexTags.mutateAsync();
      alerts.success(
        changed > 0 ? `${changed}개의 태그를 정리했습니다.` : '정리할 태그가 없습니다.'
      );
    } catch (error) {
      alerts.error(error instanceof Error ? error.message : '재색인에 실패했습니다.');
    }
  };

  const handleCategoryChange = async (id: string, name: string, categoryId: string) => {
    try {
      await updateTag.mutateAsync({ id, name, categoryId });
    } catch (error) {
      alerts.error(error instanceof Error ? error.message : '분류를 바꾸지 못했습니다.');
    }
  };

  const handleMerge = async (sourceId: string, sourceName: string) => {
    const targetId = mergeTargets[sourceId];
    if (!targetId) return;
    const target = tags.find(tag => tag.id === targetId);
    if (!target) return;
    if (
      !window.confirm(
        `"${sourceName}" 태그를 "${target.name}"(으)로 합칠까요?\n` +
          `${sourceName} 태그가 달린 글과 피드가 모두 ${target.name} 으로 바뀌고, ${sourceName} 태그는 사라집니다.`
      )
    ) {
      return;
    }
    try {
      const moved = await mergeTags.mutateAsync({ sourceId, targetId });
      setMergeTargets(current => ({ ...current, [sourceId]: '' }));
      alerts.success(`${moved}건을 ${target.name} 태그로 옮겼습니다.`);
    } catch (error) {
      alerts.error(error instanceof Error ? error.message : '태그를 합치지 못했습니다.');
    }
  };

  return (
    <section className="mb-6 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">태그 인덱스</h2>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            글 {tags.reduce((sum, tag) => sum + tag.postCount, 0)}건 · 피드{' '}
            {tags.reduce((sum, tag) => sum + tag.feedCount, 0)}건에 쓰인 태그 {tags.length}개
            {unregistered > 0 && ` · 미등록 ${unregistered}개`}
            {uncategorized > 0 && ` · 분류 안 됨 ${uncategorized}개`}
          </p>
        </div>
        <button
          type="button"
          onClick={handleReindex}
          disabled={reindexTags.isPending}
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {reindexTags.isPending ? '정리 중...' : '재색인'}
        </button>
      </div>

      {isLoading ? (
        <p className="mt-4 text-sm text-gray-400">불러오는 중...</p>
      ) : error ? (
        <p className="mt-4 text-sm text-red-600">태그 인덱스를 불러오지 못했습니다.</p>
      ) : tags.length === 0 ? (
        <p className="mt-4 text-sm text-gray-400">사용 중인 태그가 없습니다.</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs text-gray-400 dark:border-gray-700">
                <th className="py-2 pr-3 font-medium">태그</th>
                <th className="py-2 pr-3 font-medium">글</th>
                <th className="py-2 pr-3 font-medium">피드</th>
                <th className="py-2 pr-3 font-medium">합계</th>
                <th className="py-2 pr-3 font-medium">카테고리</th>
                <th className="py-2 font-medium">합치기</th>
              </tr>
            </thead>
            <tbody>
              {tags.map(tag => (
                <tr
                  key={tag.name}
                  className="border-b border-gray-100 last:border-0 dark:border-gray-800"
                >
                  <td className="py-2 pr-3">
                    <span className="font-medium text-gray-900 dark:text-white">#{tag.name}</span>
                    {tag.unregistered && (
                      <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
                        미등록
                      </span>
                    )}
                  </td>
                  <td className="py-2 pr-3 text-gray-500">{tag.postCount}</td>
                  <td className="py-2 pr-3 text-gray-500">{tag.feedCount}</td>
                  <td className="py-2 pr-3 font-bold text-gray-900 dark:text-white">
                    {tag.totalCount}
                  </td>
                  <td className="py-2 pr-3">
                    {tag.id ? (
                      <select
                        value={tag.categoryId ?? ''}
                        onChange={event =>
                          handleCategoryChange(tag.id!, tag.name, event.target.value)
                        }
                        className="rounded border border-gray-300 bg-white px-2 py-1 text-xs dark:border-gray-700 dark:bg-gray-800"
                      >
                        <option value="">{UNCATEGORIZED}</option>
                        {categories.map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-xs text-gray-400">재색인 필요</span>
                    )}
                  </td>
                  <td className="py-2">
                    {tag.id ? (
                      <div className="flex items-center gap-2">
                        <select
                          value={mergeTargets[tag.id] ?? ''}
                          onChange={event =>
                            setMergeTargets(current => ({
                              ...current,
                              [tag.id!]: event.target.value,
                            }))
                          }
                          className="rounded border border-gray-300 bg-white px-2 py-1 text-xs dark:border-gray-700 dark:bg-gray-800"
                        >
                          <option value="">합칠 태그 선택</option>
                          {tags
                            .filter(other => other.id && other.id !== tag.id)
                            .map(other => (
                              <option key={other.id} value={other.id!}>
                                {other.name}
                              </option>
                            ))}
                        </select>
                        <button
                          type="button"
                          disabled={!mergeTargets[tag.id] || mergeTags.isPending}
                          onClick={() => handleMerge(tag.id!, tag.name)}
                          className="rounded border border-gray-300 px-2 py-1 text-xs text-gray-600 transition-colors hover:border-gray-900 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-300"
                        >
                          합치기
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
