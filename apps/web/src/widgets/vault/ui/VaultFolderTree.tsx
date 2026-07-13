'use client';

import { useMemo } from 'react';
import { VaultFolder } from '@/shared/model/types/vault';
import { VaultFolderTreeNode } from './VaultFolderTreeNode';

interface VaultFolderTreeProps {
  folders: VaultFolder[];
  activeFolderId?: string | null;
  activeNoteSlug?: string;
  onFolderSelect?: (folderId: string | null) => void;
  /** 폴더 행 호버 시 그래프 스포트라이트 연동 (데스크탑 전용) */
  onFolderHover?: (folderId: string | null) => void;
}

export function VaultFolderTree({
  folders,
  activeFolderId,
  activeNoteSlug,
  onFolderSelect,
  onFolderHover,
}: VaultFolderTreeProps) {
  const autoExpandedFolderIds = useMemo(
    () => new Set(activeFolderId ? getFolderPathIds(folders, activeFolderId) : []),
    [folders, activeFolderId]
  );

  return (
    <div className="space-y-1">
      {folders.map(folder => (
        <VaultFolderTreeNode
          key={folder.id}
          folder={folder}
          activeFolderId={activeFolderId}
          activeNoteSlug={activeNoteSlug}
          autoExpandedFolderIds={autoExpandedFolderIds}
          onFolderSelect={onFolderSelect}
          onFolderHover={onFolderHover}
        />
      ))}
    </div>
  );
}

function getFolderPathIds(folders: VaultFolder[], targetId: string): string[] {
  for (const folder of folders) {
    if (folder.id === targetId) {
      return [folder.id];
    }

    const childPath = getFolderPathIds(folder.children || [], targetId);
    if (childPath.length > 0) {
      return [folder.id, ...childPath];
    }
  }

  return [];
}
