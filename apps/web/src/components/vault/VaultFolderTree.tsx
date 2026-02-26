'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { VaultFolder, VaultNote } from '@/types/api';
import { useVaultNotes } from '@/hooks/useVault';

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
      // Toggle selection off if already selected
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
        className={`flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-colors group ${
          isFolderActive
            ? 'bg-accent-light/10 text-accent-light shadow-[inset_0_0_10px_rgba(100,200,255,0.05)] border border-accent-light/20'
            : 'text-surface-300 hover:text-white hover:bg-white/10'
        }`}
      >
        <motion.div
          animate={{ rotate: isOpen ? 90 : 0 }}
          onClick={toggleOpenIcon}
          className={`transition-colors ${isFolderActive ? 'text-accent-light' : 'text-surface-500 group-hover:text-surface-300'}`}
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
          className={`w-4 h-4 ${isFolderActive ? 'text-accent-light' : 'text-surface-400 group-hover:text-surface-200'}`}
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
          className={`text-sm tracking-wide ${isFolderActive ? 'text-accent-light font-bold' : 'font-medium'}`}
        >
          {folder.name}
        </span>
        {folder.noteCount > 0 && (
          <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-white/10 text-surface-400 group-hover:text-white transition-colors">
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
            className="overflow-hidden ml-4 pl-3 border-l sm:border-surface-800 border-white/10 mt-1 space-y-1"
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
              <div className="px-3 py-2 text-xs text-surface-600 animate-pulse">
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
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all ${
                      isActive
                        ? 'bg-accent-light/10 text-accent-light font-bold border border-accent-light/20 shadow-[0_0_15px_rgba(100,200,255,0.1)]'
                        : 'text-surface-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <svg
                      className={`w-3.5 h-3.5 ${isActive ? 'text-accent-light' : 'text-surface-500'}`}
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
