'use client';

import { ChangeEvent, FormEvent, useState } from 'react';
import Image from 'next/image';
import Button from '@/shared/ui/Button';
import Input from '@/shared/ui/Input';
import {
  formatStorageBytes,
  formatStorageTime,
  storageBreadcrumbs,
} from '@/widgets/admin/lib/adminStorage';
import { useAdminStorage } from '@/widgets/admin/lib/useAdminStorage';

export function AdminStorageSection() {
  const {
    listing,
    isLoading,
    isMutating,
    activeAction,
    errorMessage,
    selectedObject,
    currentPrefix,
    navigateTo,
    refresh,
    createFolder,
    uploadFiles,
    deleteEntry,
    selectObject,
  } = useAdminStorage();
  const [folderName, setFolderName] = useState('');
  const [selectedFilesLabel, setSelectedFilesLabel] = useState('선택된 파일이 없습니다.');

  async function handleFolderSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextFolderName = folderName.trim();
    if (!nextFolderName) return;
    await createFolder(nextFolderName);
    setFolderName('');
  }

  async function handleFilesChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    if (!files.length) {
      setSelectedFilesLabel('선택된 파일이 없습니다.');
      return;
    }

    setSelectedFilesLabel(files.map(file => file.name).join(', '));
    await uploadFiles(files);
    event.target.value = '';
    setSelectedFilesLabel('선택된 파일이 없습니다.');
  }

  const breadcrumbs = storageBreadcrumbs(currentPrefix);
  const objectCount = listing?.objects.length || 0;
  const folderCount = listing?.folders.length || 0;

  return (
    <div data-cy="admin-storage-page" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl sm:text-4xl font-sans font-black tracking-tighter text-surface-900">
                Storage
              </h1>
              <span className="rounded-full border border-surface-200 bg-white px-3 py-1 text-xs font-semibold text-surface-600">
                {listing?.bucket || 'blog'} bucket
              </span>
            </div>
            <p className="mt-3 max-w-2xl text-sm sm:text-base text-surface-500 leading-relaxed">
              MinIO 콘솔을 열지 않고도 이 사이트에 연결된 `blog` 버킷만 살펴보고, 업로드와
              정리 작업을 진행할 수 있는 어드민 전용 페이지입니다.
            </p>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isLoading || isMutating}
            onClick={() => void refresh()}
            data-cy="admin-storage-refresh"
          >
            새로고침
          </Button>
        </div>
      </div>

      <section className="mb-6 rounded-2xl border border-surface-200 bg-white p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-lg font-bold text-surface-900">현재 경로</h2>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
              {breadcrumbs.map(item => (
                <button
                  key={item.prefix || 'root'}
                  type="button"
                  onClick={() => navigateTo(item.prefix)}
                  className="rounded-full border border-surface-200 bg-surface-50 px-3 py-1.5 font-medium text-surface-600 hover:border-surface-300 hover:text-surface-900"
                >
                  {item.label}
                </button>
              ))}
            </div>
            <p className="mt-3 text-sm text-surface-500 break-all">
              prefix: {currentPrefix || '/'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 min-w-[240px]">
            <div className="rounded-xl border border-surface-100 bg-surface-50 px-4 py-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-surface-400">
                폴더
              </div>
              <div className="mt-2 text-2xl font-black text-surface-900">{folderCount}</div>
            </div>
            <div className="rounded-xl border border-surface-100 bg-surface-50 px-4 py-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-surface-400">
                파일
              </div>
              <div className="mt-2 text-2xl font-black text-surface-900">{objectCount}</div>
            </div>
          </div>
        </div>

        {errorMessage ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        ) : null}
      </section>

      <section className="mb-6 grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-4">
        <div className="rounded-2xl border border-surface-200 bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-surface-900">탐색기</h2>
              <p className="mt-2 text-sm text-surface-500">
                폴더를 열어 이동하고, 파일을 선택해 미리보기와 다운로드를 이어서 확인할 수
                있습니다.
              </p>
            </div>
            {currentPrefix ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => navigateTo(listing?.parentPrefix || '')}
                disabled={isLoading || isMutating}
                data-cy="admin-storage-up"
              >
                상위로
              </Button>
            ) : null}
          </div>

          <div className="mt-5">
            <div className="text-xs font-semibold uppercase tracking-wide text-surface-400">
              폴더
            </div>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {listing?.folders.length ? (
                listing.folders.map(folder => (
                  <div
                    key={folder.key}
                    className="rounded-2xl border border-surface-200 bg-surface-50 px-4 py-4"
                  >
                    <button
                      type="button"
                      onClick={() => navigateTo(folder.key)}
                      className="w-full text-left"
                      data-cy={`admin-storage-folder-${folder.name}`}
                    >
                      <div className="text-sm font-semibold text-surface-900 break-all">
                        {folder.name}
                      </div>
                      <div className="mt-1 text-xs text-surface-500 break-all">{folder.key}</div>
                    </button>
                    <div className="mt-3 flex items-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => navigateTo(folder.key)}
                      >
                        열기
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                        disabled={isMutating}
                        onClick={() => void deleteEntry(folder.key, folder.name)}
                        data-cy={`admin-storage-delete-folder-${folder.name}`}
                      >
                        삭제
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-surface-200 bg-surface-50 px-5 py-8 text-sm text-surface-400">
                  현재 경로에 폴더가 없습니다.
                </div>
              )}
            </div>
          </div>

          <div className="mt-6">
            <div className="text-xs font-semibold uppercase tracking-wide text-surface-400">
              파일
            </div>
            <div className="mt-3 overflow-hidden rounded-2xl border border-surface-200">
              <div className="hidden md:grid md:grid-cols-[1.4fr_0.7fr_0.8fr_0.9fr] gap-3 bg-surface-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-surface-400">
                <span>이름</span>
                <span>크기</span>
                <span>수정 시각</span>
                <span>관리</span>
              </div>

              {listing?.objects.length ? (
                <div className="divide-y divide-surface-100 bg-white">
                  {listing.objects.map(object => {
                    const previewUrl = `/api/admin/storage/object?key=${encodeURIComponent(object.key)}`;
                    const downloadUrl = `${previewUrl}&download=1`;
                    const isSelected = selectedObject?.key === object.key;

                    return (
                      <div
                        key={object.key}
                        className={`grid grid-cols-1 gap-3 px-4 py-4 md:grid-cols-[1.4fr_0.7fr_0.8fr_0.9fr] ${
                          isSelected ? 'bg-surface-50' : 'bg-white'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => selectObject(object.key)}
                          className="text-left"
                          data-cy={`admin-storage-object-${object.name}`}
                        >
                          <div className="text-sm font-semibold text-surface-900 break-all">
                            {object.name}
                          </div>
                          <div className="mt-1 text-xs text-surface-500 break-all">{object.key}</div>
                        </button>
                        <div className="text-sm text-surface-500">{formatStorageBytes(object.size)}</div>
                        <div className="text-sm text-surface-500">{formatStorageTime(object.lastModified)}</div>
                        <div className="flex flex-wrap items-center gap-2">
                          <a
                            href={previewUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm font-semibold text-surface-700 hover:text-surface-900"
                          >
                            열기
                          </a>
                          <a
                            href={downloadUrl}
                            className="text-sm font-semibold text-surface-700 hover:text-surface-900"
                          >
                            다운로드
                          </a>
                          <button
                            type="button"
                            onClick={() => void deleteEntry(object.key, object.name)}
                            className="text-sm font-semibold text-red-600 hover:text-red-700"
                            data-cy={`admin-storage-delete-object-${object.name}`}
                          >
                            삭제
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white px-5 py-10 text-center text-sm text-surface-400">
                  현재 경로에 파일이 없습니다.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-surface-200 bg-white p-5">
            <h2 className="text-lg font-bold text-surface-900">업로드</h2>
            <p className="mt-2 text-sm text-surface-500">
              현재 경로에 이미지나 정적 파일을 바로 올릴 수 있습니다.
            </p>
            <label
              htmlFor="admin-storage-upload"
              className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-surface-200 bg-surface-50 px-5 py-8 text-center"
            >
              <span className="text-sm font-semibold text-surface-900">파일 선택</span>
              <span className="mt-2 text-xs text-surface-500 break-all">{selectedFilesLabel}</span>
            </label>
            <input
              id="admin-storage-upload"
              type="file"
              multiple
              className="sr-only"
              onChange={event => void handleFilesChange(event)}
              disabled={isMutating}
              data-cy="admin-storage-upload-input"
            />
            <div className="mt-3 text-xs text-surface-400">
              업로드는 현재 경로 `{currentPrefix || '/'}`에 바로 반영됩니다.
            </div>
            {isMutating && activeAction === 'upload' ? (
              <div className="mt-3 text-sm text-surface-500">파일을 업로드하는 중입니다.</div>
            ) : null}
          </div>

          <div className="rounded-2xl border border-surface-200 bg-white p-5">
            <h2 className="text-lg font-bold text-surface-900">폴더 만들기</h2>
            <form className="mt-4 space-y-3" onSubmit={event => void handleFolderSubmit(event)}>
              <Input
                value={folderName}
                onChange={event => setFolderName(event.target.value)}
                placeholder="예: hero-images"
                helperText="현재 경로 아래에 새 폴더를 만듭니다."
                disabled={isMutating}
                data-cy="admin-storage-folder-input"
              />
              <Button
                type="submit"
                size="sm"
                disabled={isMutating || !folderName.trim()}
                isLoading={isMutating && activeAction === 'folder'}
                data-cy="admin-storage-folder-submit"
              >
                폴더 생성
              </Button>
            </form>
          </div>

          <div className="rounded-2xl border border-surface-200 bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-surface-900">선택한 파일</h2>
              {selectedObject?.publicUrl ? (
                <a
                  href={selectedObject.publicUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-semibold text-surface-700 hover:text-surface-900"
                >
                  public URL
                </a>
              ) : null}
            </div>

            {selectedObject ? (
              <div className="mt-4">
                <div className="rounded-2xl border border-surface-100 bg-surface-50 p-4">
                  {selectedObject.isImage ? (
                    <div className="relative mb-4 aspect-[16/10] overflow-hidden rounded-xl border border-surface-200 bg-white">
                      <Image
                        src={`/api/admin/storage/object?key=${encodeURIComponent(selectedObject.key)}`}
                        alt={selectedObject.name}
                        fill
                        unoptimized
                        className="object-contain"
                        sizes="(max-width: 1280px) 100vw, 420px"
                      />
                    </div>
                  ) : (
                    <div className="mb-4 rounded-xl border border-dashed border-surface-200 bg-white px-4 py-8 text-center text-sm text-surface-400">
                      이미지가 아닌 파일은 새 탭에서 열거나 다운로드로 확인할 수 있습니다.
                    </div>
                  )}

                  <div className="text-sm font-semibold text-surface-900 break-all">
                    {selectedObject.name}
                  </div>
                  <div className="mt-1 text-xs text-surface-500 break-all">{selectedObject.key}</div>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-surface-500">
                    <div>
                      <div className="text-xs uppercase tracking-wide text-surface-400">크기</div>
                      <div className="mt-1">{formatStorageBytes(selectedObject.size)}</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wide text-surface-400">수정</div>
                      <div className="mt-1">{formatStorageTime(selectedObject.lastModified)}</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-dashed border-surface-200 bg-surface-50 px-5 py-8 text-sm text-surface-400">
                파일을 하나 선택하면 이곳에서 바로 내용을 확인할 수 있습니다.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-surface-200 bg-white p-5">
        <h2 className="text-lg font-bold text-surface-900">운영 가이드</h2>
        <ul className="mt-3 space-y-2 text-sm text-surface-500 leading-relaxed">
          <li>이 페이지는 `blog` 버킷만 다루며, 다른 서비스 버킷은 보이지 않습니다.</li>
          <li>이미지는 여기서 미리보기로 확인하고, 다른 파일은 다운로드로 점검할 수 있습니다.</li>
          <li>폴더 삭제는 내부 파일까지 함께 정리되므로, 필요한 경로인지 한 번 더 확인하고 진행하세요.</li>
        </ul>
      </section>
    </div>
  );
}
