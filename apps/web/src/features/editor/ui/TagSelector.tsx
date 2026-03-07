'use client';

import { useState, useRef, useEffect } from 'react';
import { useTags, useCreateTag } from '@/entities/tag/api/useTags';
import { Tag } from '@/types/blog';

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

  const filteredTags = allTags.filter(
    tag =>
      !selectedTagIds.includes(tag.id) &&
      tag.name.toLowerCase().includes(inputValue.toLowerCase())
  );

  const exactMatch = allTags.find(
    tag => tag.name.toLowerCase() === inputValue.toLowerCase()
  );

  const showCreateOption = inputValue.trim().length > 0 && !exactMatch;

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
    if (!name) return;

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
    } else if (e.key === 'Backspace' && inputValue === '' && selectedTagIds.length > 0) {
      onChange(selectedTagIds.slice(0, -1));
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <div
        className="min-h-[42px] flex flex-wrap gap-1.5 items-center px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg cursor-text focus-within:ring-2 focus-within:ring-purple-600"
        onClick={() => inputRef.current?.focus()}
      >
        {selectedTags.map(tag => (
          <span
            key={tag.id}
            className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 text-xs rounded-full"
          >
            {tag.name}
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                removeTag(tag.id);
              }}
              className="hover:text-purple-600 dark:hover:text-purple-200 leading-none"
            >
              x
            </button>
          </span>
        ))}

        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={e => {
            setInputValue(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={selectedTagIds.length === 0 ? '태그 검색 또는 생성...' : ''}
          className="flex-1 min-w-[120px] bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none"
        />
      </div>

      {isOpen && (inputValue.length > 0 || filteredTags.length > 0) && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto"
        >
          {filteredTags.map(tag => (
            <button
              key={tag.id}
              type="button"
              onClick={() => selectTag(tag)}
              className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 text-left"
            >
              <span>{tag.name}</span>
              <span className="text-xs text-gray-400">{tag.postCount}개 포스트</span>
            </button>
          ))}

          {showCreateOption && (
            <button
              type="button"
              onClick={handleCreateTag}
              disabled={createTag.isPending}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 text-left"
            >
              <span className="font-medium">+</span>
              <span>
                {createTag.isPending ? '생성 중...' : `"${inputValue.trim()}" 태그 생성`}
              </span>
            </button>
          )}

          {filteredTags.length === 0 && !showCreateOption && (
            <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
              검색 결과 없음
            </div>
          )}
        </div>
      )}
    </div>
  );
}
