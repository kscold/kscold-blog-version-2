'use client';

import { useState, useRef, useEffect } from 'react';
import { useTags } from '@/entities/tag';
import { useCreateTag } from '@/entities/tag';
import { Tag } from '@/shared/model/types/blog';
import { isSystemTagName } from '@/shared/lib/tags';

interface TagSelectorProps {
  selectedTagIds: string[];
  onChange: (tagIds: string[]) => void;
}

export function TagSelector({ selectedTagIds, onChange }: TagSelectorProps) {
  const { data: allTags = [] } = useTags();
  const createTag = useCreateTag();

  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedTags = allTags.filter(tag => selectedTagIds.includes(tag.id));
  const legacyTags = selectedTags.filter(tag => isSystemTagName(tag.name));
  const topicTags = selectedTags.filter(tag => !isSystemTagName(tag.name));

  const filteredTags = allTags.filter(
    tag =>
      !selectedTagIds.includes(tag.id) &&
      !isSystemTagName(tag.name) &&
      tag.name.toLowerCase().includes(inputValue.toLowerCase())
  );

  const exactMatch = allTags.find(
    tag => tag.name.toLowerCase() === inputValue.toLowerCase()
  );

  const showCreateOption = inputValue.trim().length > 0 && !exactMatch && !isSystemTagName(inputValue);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectTag = (tag: Tag) => {
    onChange([...selectedTagIds, tag.id]);
    setInputValue('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const removeTag = (tagId: string) => {
    onChange(selectedTagIds.filter(id => id !== tagId));
  };

  const handleCreateTag = async () => {
    const name = inputValue.trim();
    if (!name || isSystemTagName(name)) return;

    try {
      const newTag = await createTag.mutateAsync(name);
      onChange([...selectedTagIds, newTag.id]);
      setInputValue('');
      setIsOpen(false);
      inputRef.current?.focus();
    } catch {
      // 생성 실패 시 무시
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredTags.length > 0) {
        selectTag(filteredTags[0]);
      } else if (showCreateOption) {
        handleCreateTag();
      }
    } else if (e.key === 'Backspace' && inputValue === '' && topicTags.length > 0) {
      removeTag(topicTags[topicTags.length - 1].id);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <div
        className="min-h-[42px] flex flex-wrap gap-1.5 items-center px-3 py-2 bg-white border border-surface-300 rounded-lg cursor-text focus-within:ring-2 focus-within:ring-surface-900/40"
        onClick={() => inputRef.current?.focus()}
      >
        {topicTags.map(tag => (
          <span
            key={tag.id}
            className="inline-flex items-center gap-1 px-2 py-0.5 bg-surface-100 text-surface-700 text-xs rounded-full"
          >
            {tag.name}
            <button
              type="button"
              aria-label={`${tag.name} 태그 제거`}
              onClick={e => {
                e.stopPropagation();
                removeTag(tag.id);
              }}
              className="hover:text-surface-900 leading-none"
            >
              x
            </button>
          </span>
        ))}

        <input
          ref={inputRef}
          type="text"
          aria-label="주제 태그 검색 또는 생성"
          value={inputValue}
          onChange={e => {
            setInputValue(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={selectedTagIds.length === 0 ? '태그 검색 또는 생성...' : ''}
          className="flex-1 min-w-[120px] bg-transparent text-sm text-surface-900 placeholder-surface-400 outline-hidden"
        />
      </div>

      {legacyTags.length > 0 && <div className="mt-3 space-y-2 rounded-xl bg-surface-50 p-3 text-xs text-surface-600">
        <p>기존 분류 태그 · 공개 범위와 무관</p>
        <div className="flex flex-wrap gap-2">{legacyTags.map(tag => (
          <button key={tag.id} type="button" onClick={() => removeTag(tag.id)} aria-label={`${tag.name} 기존 태그 제거`}
            className="rounded-lg border border-surface-200 bg-white px-3 py-2">{tag.name} · 제거</button>
        ))}</div>
      </div>}
      {isSystemTagName(inputValue) && <p className="mt-2 text-xs text-surface-500">공개 범위는 위 발행 설정에서 선택해 주세요.</p>}

      {isOpen && (inputValue.length > 0 || filteredTags.length > 0) && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-surface-200 rounded-lg shadow-lg max-h-48 overflow-y-auto"
        >
          {filteredTags.map(tag => (
            <button
              key={tag.id}
              type="button"
              onClick={() => selectTag(tag)}
              className="w-full flex items-center justify-between px-3 py-2 text-sm text-surface-900 hover:bg-surface-50 text-left"
            >
              <span>{tag.name}</span>
              <span className="text-xs text-surface-400">{tag.postCount}개 포스트</span>
            </button>
          ))}

          {showCreateOption && (
            <button
              type="button"
              onClick={handleCreateTag}
              disabled={createTag.isPending}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-surface-900 hover:bg-surface-50 text-left"
            >
              <span className="font-medium">+</span>
              <span>
                {createTag.isPending ? '생성 중...' : `"${inputValue.trim()}" 태그 생성`}
              </span>
            </button>
          )}

          {filteredTags.length === 0 && !showCreateOption && (
            <div className="px-3 py-2 text-sm text-surface-500">
              검색 결과 없음
            </div>
          )}
        </div>
      )}
    </div>
  );
}
