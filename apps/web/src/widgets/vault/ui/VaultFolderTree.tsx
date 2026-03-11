'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { VaultFolder, VaultNote } from '@/types/vault';
import { useVaultNotes } from '@/entities/vault/api/useVault';

interface VaultFolderTreeProps {
  folders: VaultFolder[];
  activeFolderId?: string | null;
  onFolderSelect?: (folderId: string | null) => void;
}

export function VaultFolderTree({ folders, activeFolderId, onFolderSelect }: VaultFolderTreeProps) {
  return (
    <div className="space-y-1">
      {folders.map(folder => (
        <FolderNode
          key={folder.id}
          folder={folder}
          activeFolderId={activeFolderId}
          onFolderSelect={onFolderSelect}
        />
      ))}
    </div>
  );
}

function FolderNode({
  folder,
  activeFolderId,
  onFolderSelect,
}: {
  folder: VaultFolder;
  activeFolderId?: string | null;
  onFolderSelect?: (folderId: string | null) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: notesData, isLoading } = useVaultNotes(isOpen ? folder.id : '');
  const pathname = usePathname();

  const isFolderActive = activeFolderId === folder.id;

  const handleHeaderClick = () => {
    if (!isOpen) setIsOpen(true);
    if (onFolderSelect) {
      // 이미 선택된 항목 클릭 시 선택 해제
      onFolderSelect(isFolderActive ? null : folder.id);
    } else {
      setIsOpen(!isOpen);
    }
  };

  const toggleOpenIcon = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <div className="select-none">
      <div
        onClick={handleHeaderClick}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all duration-300 group ${
          isFolderActive
            ? 'bg-surface-100 dark:bg-surface-800 text-surface-900 dark:text-surface-100 font-semibold'
            : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-100 hover:bg-surface-50 dark:hover:bg-surface-900/50'
        }`}
      >
        <motion.div
          animate={{ rotate: isOpen ? 90 : 0 }}
          onClick={toggleOpenIcon}
          className={`transition-colors duration-300 ${isFolderActive ? 'text-surface-900 dark:text-surface-100' : 'text-surface-400 group-hover:text-surface-600 dark:group-hover:text-surface-300'}`}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </motion.div>

        <svg
          className={`w-4 h-4 ${isFolderActive ? 'text-surface-900 dark:text-surface-100' : 'text-surface-400 group-hover:text-surface-600 dark:group-hover:text-surface-200'}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
          />
        </svg>

        <span
          className={`text-sm tracking-wide transition-colors duration-300 ${isFolderActive ? 'text-surface-900 dark:text-surface-100 font-bold' : 'font-medium group-hover:text-surface-800 dark:group-hover:text-surface-200'}`}
        >
          {folder.name}
        </span>
        {folder.noteCount > 0 && (
          <span className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-md transition-colors duration-300 ${
            isFolderActive ? 'bg-surface-200 dark:bg-surface-700 text-surface-900 dark:text-surface-100' : 'bg-surface-100 dark:bg-surface-800 text-surface-500 dark:text-surface-400 group-hover:bg-surface-200 dark:group-hover:bg-surface-700'
          }`}>
            {folder.noteCount}
          </span>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden ml-4 pl-3 border-l border-surface-200 mt-1 space-y-1"
          >
            {folder.children &&
              folder.children.map(child => (
                <FolderNode
                  key={child.id}
                  folder={child}
                  activeFolderId={activeFolderId}
                  onFolderSelect={onFolderSelect}
                />
              ))}

            {isLoading && (
              <div className="px-3 py-2 text-xs text-surface-500 animate-pulse">
                데이터 동기화 중...
              </div>
            )}

            {!isLoading &&
              notesData?.content &&
              notesData.content.map((note: VaultNote) => {
                const isActive = pathname === `/vault/${note.slug}`;
                return (
                  <Link
                    key={note.id}
                    href={`/vault/${note.slug}`}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-300 ${
                      isActive
                        ? 'bg-surface-100 dark:bg-surface-800 text-surface-900 dark:text-surface-100 font-semibold'
                        : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-100 hover:bg-surface-50 dark:hover:bg-surface-900/50'
                    }`}
                  >
                    <svg
                      className={`w-3.5 h-3.5 transition-colors duration-300 ${isActive ? 'text-surface-900 dark:text-surface-100' : 'text-surface-400 group-hover:text-surface-600 dark:group-hover:text-surface-200'}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="truncate">{note.title}</span>
                  </Link>
                );
              })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
